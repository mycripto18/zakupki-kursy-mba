import React, { useState, useCallback, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useContent, Course } from '@/contexts/ContentContext';
import { AdminAuth } from '@/components/AdminAuth';
import { ImageUploader } from '@/components/ImageUploader';
import { PageContentEditor } from '@/components/PageContentEditor';
import { SortableCourseItem } from '@/components/SortableCourseItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Save, 
  FileJson, 
  User, 
  HelpCircle,
  Settings,
  Image,
  Link,
  Trash2,
  Plus,
  GraduationCap,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Globe,
  Tag,
  MapPin,
  Code
} from 'lucide-react';
import { SitePage, PageBlocks } from '@/contexts/ContentContext';
import { Switch } from '@/components/ui/switch';
import { StaticHtmlGenerator } from '@/components/StaticHtmlGenerator';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Валидация URL
const isValidUrl = (url: string): boolean => {
  if (!url || url === '#') return true;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const AdminContent = () => {
  const { content, updateContent, resetToDefault, exportJSON, importJSON, saveNow, isModified } = useContent();
  const [dragActive, setDragActive] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  
  // Import dialog
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedPageForImport, setSelectedPageForImport] = useState<string>('full');
  const [importFile, setImportFile] = useState<File | null>(null);
  
  // Sitemap
  const [showSitemapPreview, setShowSitemapPreview] = useState(false);
  const [sitemapContent, setSitemapContent] = useState('');

  // Bulk URLs & Promos
  const [showBulkUrls, setShowBulkUrls] = useState(false);
  const [bulkUrlsText, setBulkUrlsText] = useState('');
  const [bulkUrlsPage, setBulkUrlsPage] = useState<string>('main');
  const [showBulkPromos, setShowBulkPromos] = useState(false);
  const [bulkPromosText, setBulkPromosText] = useState('');
  const [bulkPromosPage, setBulkPromosPage] = useState<string>('main');
  const [bulkPromoDiscountText, setBulkPromoDiscountText] = useState('Скидка на курс');
  const [bulkPromoDiscountPercent, setBulkPromoDiscountPercent] = useState(10);
  const [bulkPromoMode, setBulkPromoMode] = useState<'simple' | 'advanced'>('simple');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Drag & drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setImportFile(files[0]);
      setShowImportDialog(true);
    }
  }, []);

  const handleFileUpload = (file: File, pageSlug: string) => {
    if (!file.name.endsWith('.json')) {
      toast.error('Пожалуйста, загрузите JSON файл');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (importJSON(text, pageSlug)) {
        toast.success('Контент загружен!');
        setTimeout(() => saveNow(), 100);
      } else {
        toast.error('Ошибка при загрузке. Проверьте структуру JSON.');
      }
      setShowImportDialog(false);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      toast.error('Ошибка чтения файла');
      setShowImportDialog(false);
      setImportFile(null);
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    const ok = saveNow();
    if (!ok) {
      toast.error('Не удалось сохранить.');
      return;
    }
    toast.success('Сохранено');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Вы уверены? Все изменения будут потеряны.')) {
      resetToDefault();
      toast.success('Контент сброшен');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setShowImportDialog(true);
    }
    e.target.value = '';
  };

  // Course helpers
  const updateCourse = (index: number, field: string, value: any) => {
    const newCourses = [...content.courses];
    (newCourses[index] as any)[field] = value;
    updateContent({ courses: newCourses });
  };

  const addCourse = () => {
    const newCourse = {
      id: content.courses.length + 1,
      title: 'Новый курс',
      school: 'Название школы',
      schoolLogo: '',
      url: '#',
      price: 0,
      format: 'Онлайн',
      duration: '1 месяц',
      document: 'Сертификат',
      forWhom: 'Для всех',
      features: '',
      skills: ['Навык 1'],
      advantages: ['Преимущество 1'],
      reviews: '',
      reviewLinks: []
    };
    updateContent({ courses: [...content.courses, newCourse] });
    toast.success('Курс добавлен');
  };

  const removeCourse = (index: number) => {
    if (window.confirm('Удалить этот курс?')) {
      updateContent({ courses: content.courses.filter((_, i) => i !== index) });
      toast.success('Курс удалён');
    }
  };

  // FAQ helpers
  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaq = [...content.faqData];
    newFaq[index][field] = value;
    updateContent({ faqData: newFaq });
  };

  const addFAQ = () => {
    updateContent({ faqData: [...content.faqData, { question: 'Новый вопрос?', answer: 'Ответ' }] });
    toast.success('Вопрос добавлен');
  };

  const removeFAQ = (index: number) => {
    updateContent({ faqData: content.faqData.filter((_, i) => i !== index) });
  };

  // Page helpers
  const addPage = () => {
    const newPage: SitePage = {
      id: `page-${Date.now()}`,
      slug: `new-page-${content.pages.length + 1}`,
      title: 'Новая страница',
      menuLabel: 'Новая страница',
      showInMenu: true,
      metaData: { title: 'Новая страница', description: '', keywords: '', canonicalUrl: '' },
      blocks: {
        showHeader: true, showAuthor: true, showIntro: true, showBeforeTable: true,
        showCoursesList: true, showCourseDetails: true, showContentBlocks: true, showFAQ: true
      }
    };
    updateContent({ pages: [...content.pages, newPage] });
    toast.success('Страница добавлена');
  };

  const duplicatePage = (index: number) => {
    const src = content.pages[index];
    const dup: SitePage = {
      ...JSON.parse(JSON.stringify(src)),
      id: `page-${Date.now()}`,
      slug: `${src.slug}-copy`,
      title: `${src.title} (копия)`,
      menuLabel: `${src.menuLabel} (копия)`
    };
    updateContent({ pages: [...content.pages, dup] });
    toast.success('Страница продублирована');
  };

  const updatePage = (index: number, updates: Partial<SitePage>) => {
    const newPages = [...content.pages];
    newPages[index] = { ...newPages[index], ...updates };
    updateContent({ pages: newPages });
  };

  const updatePageBlocks = (index: number, block: keyof PageBlocks, value: boolean) => {
    const newPages = [...content.pages];
    newPages[index].blocks[block] = value;
    updateContent({ pages: newPages });
  };

  const removePage = (index: number) => {
    if (window.confirm('Удалить эту страницу?')) {
      updateContent({ pages: content.pages.filter((_, i) => i !== index) });
      toast.success('Страница удалена');
    }
  };

  // Nav helpers
  const updateNavItem = (index: number, field: 'label' | 'href', value: string) => {
    const newNav = [...content.navigation];
    newNav[index][field] = value;
    updateContent({ navigation: newNav });
  };

  const addNavItem = () => {
    updateContent({ navigation: [...content.navigation, { label: 'Новый пункт', href: '#' }] });
  };

  const removeNavItem = (index: number) => {
    updateContent({ navigation: content.navigation.filter((_, i) => i !== index) });
  };

  // Bulk URLs
  const applyBulkUrls = () => {
    const urls = bulkUrlsText.split('\n').map(u => u.trim()).filter(u => u);
    const invalid = urls.filter(url => !isValidUrl(url));
    if (invalid.length > 0) { toast.error('Некорректные URL'); return; }
    
    if (bulkUrlsPage === 'main') {
      updateContent({ courses: content.courses.map((c, i) => ({ ...c, url: urls[i] || c.url })) });
    } else {
      const pi = content.pages.findIndex(p => p.slug === bulkUrlsPage);
      if (pi !== -1 && content.pages[pi].courses) {
        const newPages = [...content.pages];
        newPages[pi].courses = newPages[pi].courses!.map((c, i) => ({ ...c, url: urls[i] || c.url }));
        updateContent({ pages: newPages });
      }
    }
    toast.success(`Ссылки обновлены`);
    setShowBulkUrls(false);
    setBulkUrlsText('');
  };

  // Bulk Promos
  const parsePromoLine = (line: string, defaultText: string, defaultPercent: number) => {
    const parts = line.split('|').map(p => p.trim());
    return {
      code: parts[0],
      discountText: parts[1] || defaultText,
      discountPercent: parseInt(parts[2]) || defaultPercent
    };
  };

  const applyBulkPromos = () => {
    const lines = bulkPromosText.split('\n').map(p => p.trim()).filter(p => p);
    if (bulkPromosPage === 'main') {
      updateContent({ courses: content.courses.map((c, i) => ({
        ...c,
        promoCode: lines[i] ? parsePromoLine(lines[i], bulkPromoDiscountText, bulkPromoDiscountPercent) : c.promoCode
      })) });
    } else {
      const pi = content.pages.findIndex(p => p.slug === bulkPromosPage);
      if (pi !== -1 && content.pages[pi].courses) {
        const newPages = [...content.pages];
        newPages[pi].courses = newPages[pi].courses!.map((c, i) => ({
          ...c,
          promoCode: lines[i] ? parsePromoLine(lines[i], bulkPromoDiscountText, bulkPromoDiscountPercent) : c.promoCode
        }));
        updateContent({ pages: newPages });
      }
    }
    toast.success('Промокоды обновлены');
    setShowBulkPromos(false);
    setBulkPromosText('');
  };

  // Drag & Drop for courses
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = content.courses.findIndex(c => c.id === active.id);
      const newIndex = content.courses.findIndex(c => c.id === over.id);
      updateContent({ courses: arrayMove(content.courses, oldIndex, newIndex) });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
         <div className="mb-6">
           <div className="flex flex-col gap-4 mb-4">
             <a 
               href="/" 
               target="_blank"
               rel="noopener noreferrer"
               className="w-full flex items-center justify-center py-4 text-lg font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
             >
               Перейти на сайт →
             </a>
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
               <div>
                 <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
                 <p className="text-sm text-muted-foreground">Импорт JSON → Редактирование → Генерация HTML</p>
               </div>
               <div className="flex items-center gap-2 flex-wrap">
                 {isModified && !justSaved && (
                   <Badge variant="secondary" className="bg-amber-100 text-amber-800">Есть изменения</Badge>
                 )}
                 {justSaved && (
                   <Badge variant="secondary" className="bg-green-100 text-green-800">Сохранено ✓</Badge>
                 )}
                 <Button variant="outline" size="sm" onClick={handleReset}>
                   <RotateCcw className="w-4 h-4 mr-2" />
                   Сброс
                 </Button>
                 <Button size="sm" variant={isModified ? "default" : "outline"} onClick={handleSave}>
                   <Save className="w-4 h-4 mr-2" />
                   Сохранить
                 </Button>
               </div>
             </div>
           </div>

          {/* Drag & Drop Zone */}
          <Card 
            className={`border-2 border-dashed transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-base font-medium text-foreground mb-1">Перетащите JSON файл сюда</p>
              <p className="text-sm text-muted-foreground mb-3">или нажмите кнопку ниже</p>
              <label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Button variant="outline" asChild>
                  <span>
                    <FileJson className="w-4 h-4 mr-2" />
                    Выбрать файл
                  </span>
                </Button>
              </label>
            </CardContent>
          </Card>

          {/* Import Dialog */}
          <Dialog open={showImportDialog} onOpenChange={(open) => {
            setShowImportDialog(open);
            if (!open) setImportFile(null);
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Импорт контента</DialogTitle>
                <DialogDescription>Выберите куда импортировать данные</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {importFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <FileJson className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{importFile.name}</span>
                  </div>
                )}
                <Select value={selectedPageForImport} onValueChange={setSelectedPageForImport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите куда импортировать" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">📦 Весь сайт (заменить всё)</SelectItem>
                    <SelectItem value="main">📄 Главная страница</SelectItem>
                    {content.pages.map(page => (
                      <SelectItem key={page.id} value={page.slug}>
                        📄 {page.menuLabel} (/{page.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowImportDialog(false); setImportFile(null); }}>
                  Отмена
                </Button>
                <Button disabled={!importFile} onClick={() => importFile && handleFileUpload(importFile, selectedPageForImport)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Импортировать
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk URLs Dialog */}
          <Dialog open={showBulkUrls} onOpenChange={setShowBulkUrls}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Массовая вставка ссылок</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select value={bulkUrlsPage} onValueChange={setBulkUrlsPage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Главная ({content.courses.length} курсов)</SelectItem>
                    {content.pages.filter(p => p.courses?.length).map(page => (
                      <SelectItem key={page.id} value={page.slug}>{page.menuLabel} ({page.courses?.length || 0})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={bulkUrlsText}
                  onChange={(e) => setBulkUrlsText(e.target.value)}
                  placeholder={`https://link1.com/\nhttps://link2.com/`}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkUrls(false)}>Отмена</Button>
                <Button onClick={applyBulkUrls}><Link className="w-4 h-4 mr-2" />Применить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Promos Dialog */}
          <Dialog open={showBulkPromos} onOpenChange={setShowBulkPromos}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Массовая вставка промокодов</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select value={bulkPromosPage} onValueChange={setBulkPromosPage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Главная ({content.courses.length} курсов)</SelectItem>
                    {content.pages.filter(p => p.courses?.length).map(page => (
                      <SelectItem key={page.id} value={page.slug}>{page.menuLabel} ({page.courses?.length || 0})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant={bulkPromoMode === 'simple' ? 'default' : 'outline'} size="sm" onClick={() => setBulkPromoMode('simple')}>Простой</Button>
                  <Button variant={bulkPromoMode === 'advanced' ? 'default' : 'outline'} size="sm" onClick={() => setBulkPromoMode('advanced')}>Расширенный</Button>
                </div>
                {bulkPromoMode === 'simple' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Текст скидки</label>
                      <Input value={bulkPromoDiscountText} onChange={(e) => setBulkPromoDiscountText(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Процент</label>
                      <Input type="number" value={bulkPromoDiscountPercent} onChange={(e) => setBulkPromoDiscountPercent(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                )}
                <Textarea
                  value={bulkPromosText}
                  onChange={(e) => setBulkPromosText(e.target.value)}
                  placeholder={bulkPromoMode === 'simple' ? `PROMO1\nPROMO2` : `PROMO1|Текст|20\nPROMO2|Текст|30`}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkPromos(false)}>Отмена</Button>
                <Button onClick={applyBulkPromos}><Tag className="w-4 h-4 mr-2" />Применить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* ===== 4 TABS ===== */}
        <Tabs defaultValue="static" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="static" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Генерация HTML</span>
              <span className="sm:hidden">HTML</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Контент</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Курсы</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Страницы</span>
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB 1: Генерация HTML ===== */}
          <TabsContent value="static">
            <StaticHtmlGenerator />
          </TabsContent>

          {/* ===== TAB 2: Контент (SEO + Автор + Intro + ContentBlocks + FAQ + Footer) ===== */}
          <TabsContent value="content">
            <div className="space-y-6">
              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    SEO и метатеги
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">H1 (Заголовок страницы)</label>
                    <Textarea value={content.pageTitle} onChange={(e) => updateContent({ pageTitle: e.target.value })} className="min-h-[60px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Title (в браузере)</label>
                    <Textarea value={content.metaData.title} onChange={(e) => updateContent({ metaData: { ...content.metaData, title: e.target.value } })} className="min-h-[60px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea value={content.metaData.description} onChange={(e) => updateContent({ metaData: { ...content.metaData, description: e.target.value } })} className="min-h-[80px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Keywords</label>
                    <Textarea value={content.metaData.keywords} onChange={(e) => updateContent({ metaData: { ...content.metaData, keywords: e.target.value } })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Canonical URL</label>
                    <Input value={content.metaData.canonicalUrl} onChange={(e) => updateContent({ metaData: { ...content.metaData, canonicalUrl: e.target.value } })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Вводный текст</label>
                    <Textarea value={content.introText} onChange={(e) => updateContent({ introText: e.target.value })} className="min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Дата обновления</label>
                      <div className="flex gap-2">
                        <Input type="date" value={content.updatedAt || ''} onChange={(e) => updateContent({ updatedAt: e.target.value })} />
                        <Button variant="outline" size="sm" onClick={() => updateContent({ updatedAt: new Date().toISOString().split('T')[0] })}>
                          Сегодня
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Рекламная пометка</label>
                      <Input value={content.adDisclosureText || ''} onChange={(e) => updateContent({ adDisclosureText: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Favicon */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Favicon сайта
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img 
                        src="/favicon.png" 
                        alt="Favicon" 
                        className="w-16 h-16 rounded-lg border object-contain bg-white p-1"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Favicon отображается во вкладке браузера. Замените файл <code className="bg-muted px-1 rounded">/favicon.png</code> в папке <code className="bg-muted px-1 rounded">public/</code>.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Рекомендуемый размер: <strong>32×32</strong> или <strong>180×180</strong> px (PNG).
                      </p>
                      <ImageUploader
                        label="Загрузить новый favicon"
                        value=""
                        onChange={(path) => {
                          toast.success('Favicon путь установлен: ' + path);
                        }}
                        previewClassName="w-10 h-10 rounded object-contain"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Author */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Автор и шапка
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Имя автора</label>
                      <Input value={content.author.name} onChange={(e) => updateContent({ author: { ...content.author, name: e.target.value } })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Ссылка</label>
                      <Input value={content.author.link} onChange={(e) => updateContent({ author: { ...content.author, link: e.target.value } })} />
                    </div>
                  </div>
                  <ImageUploader
                    label="Фото автора"
                    value={content.author.photo}
                    onChange={(photo) => updateContent({ author: { ...content.author, photo } })}
                    previewClassName="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Описание автора</label>
                    <Textarea value={content.author.description} onChange={(e) => updateContent({ author: { ...content.author, description: e.target.value } })} className="min-h-[80px]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium mb-2">Кол-во отзывов</label>
                      <Input value={content.headerStats.reviewsCount} onChange={(e) => updateContent({ headerStats: { ...content.headerStats, reviewsCount: e.target.value } })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Бейдж</label>
                      <Input value={content.headerStats.badgeText} onChange={(e) => updateContent({ headerStats: { ...content.headerStats, badgeText: e.target.value } })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Подзаголовок</label>
                      <Input value={content.headerStats.subtitle} onChange={(e) => updateContent({ headerStats: { ...content.headerStats, subtitle: e.target.value } })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Before Table Block */}
              <Card>
                <CardHeader>
                  <CardTitle>Блок перед таблицей</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Заголовок</label>
                    <Input value={content.beforeTableBlock.title} onChange={(e) => updateContent({ beforeTableBlock: { ...content.beforeTableBlock, title: e.target.value } })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Параграфы (через пустую строку)</label>
                    <Textarea
                      value={content.beforeTableBlock.paragraphs.join('\n\n')}
                      onChange={(e) => updateContent({ beforeTableBlock: { ...content.beforeTableBlock, paragraphs: e.target.value.split('\n\n').filter(s => s.trim()) } })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Критерии</label>
                    {content.beforeTableBlock.criteria.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input className="w-20" value={item.icon} onChange={(e) => {
                          const c = [...content.beforeTableBlock.criteria];
                          c[index] = { ...c[index], icon: e.target.value };
                          updateContent({ beforeTableBlock: { ...content.beforeTableBlock, criteria: c } });
                        }} />
                        <Input className="flex-1" value={item.text} onChange={(e) => {
                          const c = [...content.beforeTableBlock.criteria];
                          c[index] = { ...c[index], text: e.target.value };
                          updateContent({ beforeTableBlock: { ...content.beforeTableBlock, criteria: c } });
                        }} />
                        <Button variant="ghost" size="sm" onClick={() => {
                          updateContent({ beforeTableBlock: { ...content.beforeTableBlock, criteria: content.beforeTableBlock.criteria.filter((_, i) => i !== index) } });
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => {
                      updateContent({ beforeTableBlock: { ...content.beforeTableBlock, criteria: [...content.beforeTableBlock.criteria, { icon: '✅', text: 'Новый критерий' }] } });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Content Blocks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Контент-блоки ({content.contentBlocks.length})</span>
                    <Button size="sm" onClick={() => {
                      updateContent({ contentBlocks: [...content.contentBlocks, { title: 'Новый блок', paragraphs: ['Текст'], list: [] }] });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {content.contentBlocks.map((block, blockIndex) => (
                      <AccordionItem key={blockIndex} value={`block-${blockIndex}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <span className="text-left">{block.title || 'Без заголовка'}</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Заголовок</label>
                            <Input value={block.title} onChange={(e) => {
                              const b = [...content.contentBlocks]; b[blockIndex] = { ...b[blockIndex], title: e.target.value };
                              updateContent({ contentBlocks: b });
                            }} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Параграфы (через Enter)</label>
                            <Textarea value={(block.paragraphs || []).join('\n\n')} onChange={(e) => {
                              const b = [...content.contentBlocks]; b[blockIndex] = { ...b[blockIndex], paragraphs: e.target.value.split('\n\n').filter(s => s.trim()) };
                              updateContent({ contentBlocks: b });
                            }} className="min-h-[100px]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Список</label>
                            {(block.list || []).map((item, itemIndex) => (
                              <div key={itemIndex} className="flex gap-2 mb-2">
                                <Input className="w-20" value={item.icon} onChange={(e) => {
                                  const b = [...content.contentBlocks]; const l = [...(b[blockIndex].list || [])];
                                  l[itemIndex] = { ...l[itemIndex], icon: e.target.value }; b[blockIndex] = { ...b[blockIndex], list: l };
                                  updateContent({ contentBlocks: b });
                                }} />
                                <Input className="flex-1" value={item.text} onChange={(e) => {
                                  const b = [...content.contentBlocks]; const l = [...(b[blockIndex].list || [])];
                                  l[itemIndex] = { ...l[itemIndex], text: e.target.value }; b[blockIndex] = { ...b[blockIndex], list: l };
                                  updateContent({ contentBlocks: b });
                                }} />
                                <Button variant="ghost" size="sm" onClick={() => {
                                  const b = [...content.contentBlocks]; b[blockIndex] = { ...b[blockIndex], list: (b[blockIndex].list || []).filter((_, i) => i !== itemIndex) };
                                  updateContent({ contentBlocks: b });
                                }}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => {
                              const b = [...content.contentBlocks]; b[blockIndex] = { ...b[blockIndex], list: [...(b[blockIndex].list || []), { icon: '✅', text: 'Новый пункт' }] };
                              updateContent({ contentBlocks: b });
                            }}>
                              <Plus className="w-4 h-4 mr-2" />
                              Добавить пункт
                            </Button>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => {
                            updateContent({ contentBlocks: content.contentBlocks.filter((_, i) => i !== blockIndex) });
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить блок
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="flex items-center gap-2"><HelpCircle className="w-5 h-5" /> FAQ ({content.faqData.length})</span>
                    <Button size="sm" onClick={addFAQ}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {content.faqData.map((item, index) => (
                      <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <span className="text-left">{item.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <Input value={item.question} onChange={(e) => updateFAQ(index, 'question', e.target.value)} placeholder="Вопрос" />
                          <Textarea value={item.answer} onChange={(e) => updateFAQ(index, 'answer', e.target.value)} placeholder="Ответ" className="min-h-[80px]" />
                          <Button variant="destructive" size="sm" onClick={() => removeFAQ(index)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Footer */}
              <Card>
                <CardHeader>
                  <CardTitle>Настройки футера</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Текст дисклеймера</label>
                    <Textarea value={content.footerText || ''} onChange={(e) => updateContent({ footerText: e.target.value })} className="min-h-[80px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input value={content.footerEmail || ''} onChange={(e) => updateContent({ footerEmail: e.target.value })} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium">Ссылки в футере</label>
                      <Button variant="outline" size="sm" onClick={() => {
                        updateContent({ footerLinks: [...(content.footerLinks || []), { label: 'Новая ссылка', href: '/', isExternal: false }] });
                      }}>
                        <Plus className="w-3 h-3 mr-1" />
                        Добавить
                      </Button>
                    </div>
                    {(content.footerLinks || []).map((link, index) => (
                      <div key={index} className="flex gap-2 items-center mb-2">
                        <Input value={link.label} onChange={(e) => {
                          const links = [...(content.footerLinks || [])]; links[index] = { ...links[index], label: e.target.value };
                          updateContent({ footerLinks: links });
                        }} placeholder="Название" className="flex-1" />
                        <Input value={link.href} onChange={(e) => {
                          const links = [...(content.footerLinks || [])]; links[index] = { ...links[index], href: e.target.value };
                          updateContent({ footerLinks: links });
                        }} placeholder="URL" className="flex-1" />
                        <Button variant="ghost" size="sm" onClick={() => {
                          updateContent({ footerLinks: (content.footerLinks || []).filter((_, i) => i !== index) });
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Sitemap */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Карта сайта (Sitemap)
                    </h4>
                    <Button onClick={() => {
                      const baseUrl = content.metaData.canonicalUrl?.replace(/\/$/, '') || 'https://example.com';
                      const today = new Date().toISOString().split('T')[0];
                      const urls = [
                        { loc: `${baseUrl}/`, priority: '1.0' },
                        ...content.pages.filter(p => p.showInMenu !== false).map(p => ({ loc: `${baseUrl}/${p.slug}`, priority: '0.8' }))
                      ];
                      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n</urlset>`;
                      setSitemapContent(sitemap);
                      setShowSitemapPreview(true);
                    }}>
                      <Globe className="w-4 h-4 mr-2" />
                      Сгенерировать sitemap.xml
                    </Button>
                  </div>

                  <Dialog open={showSitemapPreview} onOpenChange={setShowSitemapPreview}>
                    <DialogContent className="max-w-3xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Предпросмотр sitemap.xml</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-auto max-h-[50vh] bg-muted rounded-lg p-4">
                        <pre className="text-xs font-mono whitespace-pre-wrap">{sitemapContent}</pre>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => { navigator.clipboard.writeText(sitemapContent); toast.success('Скопировано'); }}>
                          <Copy className="w-4 h-4 mr-2" />
                          Копировать
                        </Button>
                        <Button onClick={() => {
                          const blob = new Blob([sitemapContent], { type: 'application/xml' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a'); a.href = url; a.download = 'sitemap.xml'; a.click();
                          URL.revokeObjectURL(url); toast.success('Скачан');
                          setShowSitemapPreview(false);
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Скачать
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ===== TAB 3: Курсы ===== */}
          <TabsContent value="courses">
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-xl font-semibold">Курсы ({content.courses.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setShowBulkUrls(true)}>
                    <Link className="w-4 h-4 mr-2" />
                    Ссылки
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowBulkPromos(true)}>
                    <Tag className="w-4 h-4 mr-2" />
                    Промокоды
                  </Button>
                  <Button size="sm" onClick={addCourse}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">Перетаскивайте курсы за ≡ для изменения порядка</p>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={content.courses.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <Accordion type="single" collapsible className="space-y-2">
                    {content.courses.map((course, index) => (
                      <SortableCourseItem key={course.id} course={course} index={index}>
                        <div className="space-y-4 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Название</label>
                              <Input value={course.title} onChange={(e) => updateCourse(index, 'title', e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Школа</label>
                              <Input value={course.school} onChange={(e) => updateCourse(index, 'school', e.target.value)} />
                            </div>
                          </div>

                          <ImageUploader
                            label="Логотип школы"
                            value={course.schoolLogo}
                            onChange={(logo) => updateCourse(index, 'schoolLogo', logo)}
                            previewClassName="h-10 object-contain"
                          />

                          <div>
                            <label className="block text-sm font-medium mb-2">URL курса</label>
                            <Input value={course.url} onChange={(e) => updateCourse(index, 'url', e.target.value)} placeholder="https://..." />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Цена (₽)</label>
                              <Input type="number" value={course.price} onChange={(e) => updateCourse(index, 'price', Number(e.target.value))} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Старая цена</label>
                              <Input type="number" value={course.oldPrice || ''} onChange={(e) => updateCourse(index, 'oldPrice', e.target.value ? Number(e.target.value) : undefined)} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Рассрочка (₽/мес)</label>
                              <Input type="number" value={course.installment || ''} onChange={(e) => updateCourse(index, 'installment', e.target.value ? Number(e.target.value) : undefined)} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Формат</label>
                              <Textarea value={course.format} onChange={(e) => updateCourse(index, 'format', e.target.value)} className="min-h-[60px]" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Документ</label>
                              <Input value={course.document} onChange={(e) => updateCourse(index, 'document', e.target.value)} />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Длительность</label>
                            <Textarea value={course.duration} onChange={(e) => updateCourse(index, 'duration', e.target.value)} className="min-h-[60px]" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Для кого</label>
                            <Textarea value={course.forWhom} onChange={(e) => updateCourse(index, 'forWhom', e.target.value)} className="min-h-[60px]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Особенности курса (одним абзацем)</label>
                            <Textarea value={String(course.features || '')} onChange={(e) => updateCourse(index, 'features', e.target.value)} className="min-h-[80px]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Навыки (через Enter)</label>
                            <Textarea value={course.skills.join('\n')} onChange={(e) => updateCourse(index, 'skills', e.target.value.split('\n'))} onBlur={(e) => updateCourse(index, 'skills', e.target.value.split('\n').filter(s => s.trim()))} className="min-h-[80px]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Преимущества (через Enter)</label>
                            <Textarea value={course.advantages.join('\n')} onChange={(e) => updateCourse(index, 'advantages', e.target.value.split('\n'))} onBlur={(e) => updateCourse(index, 'advantages', e.target.value.split('\n').filter(s => s.trim()))} className="min-h-[60px]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Преподаватели (через Enter: Имя — Описание)</label>
                            <Textarea 
                              value={(course.teachers || []).map(t => `${t.name} — ${t.description}`).join('\n')} 
                              onChange={(e) => updateCourse(index, 'teachers', e.target.value.split('\n').map(line => {
                                const parts = line.split('—').map(s => s.trim());
                                return { name: parts[0] || '', description: parts.slice(1).join('—').trim() || '' };
                              }))}
                              onBlur={(e) => updateCourse(index, 'teachers', e.target.value.split('\n').filter(s => s.trim()).map(line => {
                                const parts = line.split('—').map(s => s.trim());
                                return { name: parts[0] || '', description: parts.slice(1).join('—').trim() || '' };
                              }))}
                              className="min-h-[80px]" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Программа (через Enter)</label>
                            <Textarea value={(course.program || []).join('\n')} onChange={(e) => updateCourse(index, 'program', e.target.value.split('\n'))} onBlur={(e) => updateCourse(index, 'program', e.target.value.split('\n').filter(s => s.trim()))} className="min-h-[80px]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Отзывы</label>
                            <Textarea value={course.reviews} onChange={(e) => updateCourse(index, 'reviews', e.target.value)} />
                          </div>

                          {/* Review Links */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Ссылки на отзывы</label>
                            {(course.reviewLinks || []).map((link, li) => (
                              <div key={li} className="grid grid-cols-5 gap-2 mb-2">
                                <Input placeholder="Платформа" value={link.platform} onChange={(e) => {
                                  const nl = [...(course.reviewLinks || [])]; nl[li] = { ...nl[li], platform: e.target.value }; updateCourse(index, 'reviewLinks', nl);
                                }} />
                                <Input placeholder="Кол-во" value={link.count} onChange={(e) => {
                                  const nl = [...(course.reviewLinks || [])]; nl[li] = { ...nl[li], count: e.target.value }; updateCourse(index, 'reviewLinks', nl);
                                }} />
                                <Input placeholder="Рейтинг" value={link.rating} onChange={(e) => {
                                  const nl = [...(course.reviewLinks || [])]; nl[li] = { ...nl[li], rating: e.target.value }; updateCourse(index, 'reviewLinks', nl);
                                }} />
                                <Input placeholder="URL" value={link.url} onChange={(e) => {
                                  const nl = [...(course.reviewLinks || [])]; nl[li] = { ...nl[li], url: e.target.value }; updateCourse(index, 'reviewLinks', nl);
                                }} />
                                <Button variant="ghost" size="sm" onClick={() => updateCourse(index, 'reviewLinks', (course.reviewLinks || []).filter((_, i) => i !== li))}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => updateCourse(index, 'reviewLinks', [...(course.reviewLinks || []), { platform: '', count: '', rating: '', url: '' }])}>
                              <Plus className="w-4 h-4 mr-2" />
                              Добавить
                            </Button>
                          </div>

                          {/* Badge & Promo */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Бейдж</label>
                              <select className="w-full border rounded-md px-3 py-2" value={course.badge || ''} onChange={(e) => updateCourse(index, 'badge', e.target.value || undefined)}>
                                <option value="">Без бейджа</option>
                                <option value="top">ТОП</option>
                                <option value="popular">Популярный</option>
                                <option value="new">Новый</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Скидка</label>
                              <Input value={course.discount || ''} onChange={(e) => updateCourse(index, 'discount', e.target.value || undefined)} placeholder="-30%" />
                            </div>
                          </div>

                          <div className="border rounded-lg p-4 bg-muted/30">
                            <label className="block text-sm font-medium mb-3">Промокод</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <Input value={course.promoCode?.code || ''} onChange={(e) => {
                                const code = e.target.value;
                                if (code) updateCourse(index, 'promoCode', { code, discountText: course.promoCode?.discountText || 'Скидка', discountPercent: course.promoCode?.discountPercent || 10 });
                                else updateCourse(index, 'promoCode', undefined);
                              }} placeholder="PROMO2024" />
                              <Input value={course.promoCode?.discountText || ''} onChange={(e) => {
                                if (course.promoCode?.code) updateCourse(index, 'promoCode', { ...course.promoCode, discountText: e.target.value });
                              }} placeholder="Текст скидки" disabled={!course.promoCode?.code} />
                              <Input type="number" value={course.promoCode?.discountPercent || ''} onChange={(e) => {
                                if (course.promoCode?.code) updateCourse(index, 'promoCode', { ...course.promoCode, discountPercent: parseInt(e.target.value) || 0 });
                              }} placeholder="%" disabled={!course.promoCode?.code} />
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <Button variant="destructive" size="sm" onClick={() => removeCourse(index)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Удалить курс
                            </Button>
                          </div>
                        </div>
                      </SortableCourseItem>
                    ))}
                  </Accordion>
                </SortableContext>
              </DndContext>
            </div>
          </TabsContent>

          {/* ===== TAB 4: Страницы (Navigation + Pages + Legal) ===== */}
          <TabsContent value="pages">
            <div className="space-y-6">
              {/* Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Меню навигации
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {content.navigation.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input value={item.label} onChange={(e) => updateNavItem(index, 'label', e.target.value)} placeholder="Название" className="flex-1" />
                      <Input value={item.href} onChange={(e) => updateNavItem(index, 'href', e.target.value)} placeholder="Ссылка" className="flex-1" />
                      <Button variant="ghost" size="sm" onClick={() => removeNavItem(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addNavItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                </CardContent>
              </Card>

              {/* Additional Pages */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Дополнительные страницы ({content.pages.length})
                    </CardTitle>
                    <Button size="sm" onClick={addPage}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {content.pages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">Нет дополнительных страниц</p>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-3">
                      {content.pages.map((page, index) => (
                        <AccordionItem key={page.id} value={page.id} className="border rounded-lg">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="outline">/{page.slug}</Badge>
                              <span className="font-medium">{page.title}</span>
                              {page.showInMenu && <Badge variant="secondary">В меню</Badge>}
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); duplicatePage(index); }} className="ml-auto">
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">URL (slug)</label>
                                <Input value={page.slug} onChange={(e) => updatePage(index, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Название в меню</label>
                                <Input value={page.menuLabel} onChange={(e) => updatePage(index, { menuLabel: e.target.value })} />
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Switch checked={page.showInMenu} onCheckedChange={(checked) => updatePage(index, { showInMenu: checked })} />
                              <label className="text-sm">Показывать в меню</label>
                            </div>

                            {/* SEO */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">SEO</h4>
                              <Input value={page.metaData.title} onChange={(e) => updatePage(index, { metaData: { ...page.metaData, title: e.target.value } })} placeholder="Title" />
                              <Textarea value={page.metaData.description} onChange={(e) => updatePage(index, { metaData: { ...page.metaData, description: e.target.value } })} placeholder="Description" />
                              <Input value={page.metaData.keywords || ''} onChange={(e) => updatePage(index, { metaData: { ...page.metaData, keywords: e.target.value } })} placeholder="Keywords" />
                              <Input value={page.metaData.canonicalUrl || ''} onChange={(e) => updatePage(index, { metaData: { ...page.metaData, canonicalUrl: e.target.value } })} placeholder="Canonical URL" />
                            </div>

                            {/* Blocks */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Отображаемые блоки</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  { key: 'showHeader', label: 'Шапка' },
                                  { key: 'showAuthor', label: 'Автор' },
                                  { key: 'showIntro', label: 'Вступление' },
                                  { key: 'showBeforeTable', label: 'До таблицы' },
                                  { key: 'showCoursesList', label: 'Список курсов' },
                                  { key: 'showCourseDetails', label: 'Детали курсов' },
                                  { key: 'showContentBlocks', label: 'Контент-блоки' },
                                  { key: 'showFAQ', label: 'FAQ' },
                                ].map(({ key, label }) => (
                                  <div key={key} className="flex items-center gap-2">
                                    <Switch checked={page.blocks[key as keyof PageBlocks]} onCheckedChange={(checked) => updatePageBlocks(index, key as keyof PageBlocks, checked)} />
                                    <label className="text-sm">{label}</label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <PageContentEditor page={page} pageIndex={index} onUpdatePage={updatePage} />

                            <Button variant="destructive" size="sm" onClick={() => removePage(index)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Удалить страницу
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>

              {/* Legal Pages */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Правовые страницы
                    </CardTitle>
                    <Button size="sm" onClick={() => {
                      updateContent({ legalPages: [...(content.legalPages || []), {
                        id: `legal-${Date.now()}`, slug: `page-${Date.now()}`, title: 'Новая страница',
                        showInFooter: true, sections: [{ title: '1. Общие положения', content: 'Текст...' }],
                      }] });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(content.legalPages || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Нет правовых страниц</p>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-3">
                      {(content.legalPages || []).map((page, pageIndex) => (
                        <AccordionItem key={page.id} value={page.id} className="border rounded-lg">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{page.title}</span>
                              <Badge variant="outline">/{page.slug}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Заголовок</label>
                                <Input value={page.title} onChange={(e) => {
                                  const pages = [...(content.legalPages || [])]; pages[pageIndex] = { ...pages[pageIndex], title: e.target.value };
                                  updateContent({ legalPages: pages });
                                }} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Slug</label>
                                <Input value={page.slug} onChange={(e) => {
                                  const pages = [...(content.legalPages || [])]; pages[pageIndex] = { ...pages[pageIndex], slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') };
                                  updateContent({ legalPages: pages });
                                }} />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Switch checked={page.showInFooter} onCheckedChange={(checked) => {
                                const pages = [...(content.legalPages || [])]; pages[pageIndex] = { ...pages[pageIndex], showInFooter: checked };
                                updateContent({ legalPages: pages });
                              }} />
                              <label className="text-sm">Показывать в футере</label>
                            </div>

                            {/* Sections */}
                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium">Разделы</label>
                                <Button variant="outline" size="sm" onClick={() => {
                                  const pages = [...(content.legalPages || [])];
                                  pages[pageIndex] = { ...pages[pageIndex], sections: [...pages[pageIndex].sections, { title: 'Новый раздел', content: 'Текст...' }] };
                                  updateContent({ legalPages: pages });
                                }}>
                                  <Plus className="w-3 h-3 mr-1" />
                                  Добавить
                                </Button>
                              </div>
                              {page.sections.map((section, si) => (
                                <div key={si} className="border rounded-lg p-3 bg-muted/30 space-y-2 mb-2">
                                  <div className="flex gap-2">
                                    <Input value={section.title} onChange={(e) => {
                                      const pages = [...(content.legalPages || [])]; const sections = [...pages[pageIndex].sections];
                                      sections[si] = { ...sections[si], title: e.target.value }; pages[pageIndex] = { ...pages[pageIndex], sections };
                                      updateContent({ legalPages: pages });
                                    }} className="flex-1 h-8 text-sm" />
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                      const pages = [...(content.legalPages || [])];
                                      pages[pageIndex] = { ...pages[pageIndex], sections: pages[pageIndex].sections.filter((_, i) => i !== si) };
                                      updateContent({ legalPages: pages });
                                    }}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <Textarea value={section.content} onChange={(e) => {
                                    const pages = [...(content.legalPages || [])]; const sections = [...pages[pageIndex].sections];
                                    sections[si] = { ...sections[si], content: e.target.value }; pages[pageIndex] = { ...pages[pageIndex], sections };
                                    updateContent({ legalPages: pages });
                                  }} className="min-h-[80px] text-sm" />
                                </div>
                              ))}
                            </div>

                            <Button variant="destructive" size="sm" onClick={() => {
                              if (confirm(`Удалить "${page.title}"?`)) {
                                updateContent({ legalPages: (content.legalPages || []).filter((_, i) => i !== pageIndex) });
                              }
                            }}>
                              <Trash2 className="w-3 h-3 mr-1" />
                              Удалить
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Admin = () => (
  <AdminAuth>
    <AdminContent />
  </AdminAuth>
);

export default Admin;
