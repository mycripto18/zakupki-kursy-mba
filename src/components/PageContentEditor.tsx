import React from 'react';
import { SitePage, Course, FAQItem, ContentBlock, Author, HeaderStats, BeforeTableBlock as BeforeTableBlockType } from '@/contexts/ContentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ImageUploader } from '@/components/ImageUploader';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PageContentEditorProps {
  page: SitePage;
  pageIndex: number;
  onUpdatePage: (index: number, updates: Partial<SitePage>) => void;
}

export const PageContentEditor: React.FC<PageContentEditorProps> = ({ page, pageIndex, onUpdatePage }) => {
  // Функции обновления контента страницы
  const updatePageContent = (updates: Partial<SitePage>) => {
    onUpdatePage(pageIndex, updates);
  };

  // Курсы
  const updatePageCourse = (courseIndex: number, field: string, value: any) => {
    const courses = [...(page.courses || [])];
    (courses[courseIndex] as any)[field] = value;
    updatePageContent({ courses });
  };

  const addPageCourse = () => {
    const newCourse: Course = {
      id: (page.courses?.length || 0) + 1,
      title: 'Новый курс',
      school: 'Название школы',
      schoolLogo: 'https://placehold.co/200x80/3b82f6/ffffff?text=Logo',
      url: '#',
      price: 0,
      format: 'Онлайн',
      duration: '1 месяц',
      document: 'Сертификат',
      forWhom: 'Для всех',
      features: '',
      skills: ['Навык 1'],
      advantages: ['Преимущество 1'],
      reviews: 'Отзывы студентов',
      reviewLinks: []
    };
    updatePageContent({ courses: [...(page.courses || []), newCourse] });
    toast.success('Курс добавлен');
  };

  const removePageCourse = (courseIndex: number) => {
    if (window.confirm('Удалить этот курс?')) {
      const courses = (page.courses || []).filter((_, i) => i !== courseIndex);
      updatePageContent({ courses });
      toast.success('Курс удалён');
    }
  };

  // FAQ
  const updatePageFAQ = (faqIndex: number, field: 'question' | 'answer', value: string) => {
    const faqData = [...(page.faqData || [])];
    faqData[faqIndex][field] = value;
    updatePageContent({ faqData });
  };

  const addPageFAQ = () => {
    const newFaq: FAQItem = { question: 'Новый вопрос?', answer: 'Ответ на вопрос' };
    updatePageContent({ faqData: [...(page.faqData || []), newFaq] });
    toast.success('Вопрос добавлен');
  };

  const removePageFAQ = (faqIndex: number) => {
    const faqData = (page.faqData || []).filter((_, i) => i !== faqIndex);
    updatePageContent({ faqData });
    toast.success('Вопрос удалён');
  };

  return (
    <div className="space-y-6 mt-6 border-t pt-6">
      <h4 className="font-semibold text-lg">Контент страницы</h4>

      {/* Заголовок страницы */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Заголовок и вступление</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">H1 (Заголовок страницы)</label>
            <Textarea
              value={page.pageTitle || ''}
              onChange={(e) => updatePageContent({ pageTitle: e.target.value })}
              placeholder="Оставьте пустым для использования общего"
              className="min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Вводный текст</label>
            <Textarea
              value={page.introText || ''}
              onChange={(e) => updatePageContent({ introText: e.target.value })}
              placeholder="Оставьте пустым для использования общего"
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Автор */}
      {page.blocks.showAuthor && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Автор</CardTitle>
            <CardDescription>Оставьте пустым для использования общего автора</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Имя автора</label>
              <Input
                value={page.author?.name || ''}
                onChange={(e) => updatePageContent({ 
                  author: { ...(page.author || { name: '', photo: '', description: '', link: '' }), name: e.target.value } 
                })}
                placeholder="Имя автора"
              />
            </div>
            <ImageUploader
              label="Фото автора"
              value={page.author?.photo || ''}
              onChange={(photo) => updatePageContent({ 
                author: { ...(page.author || { name: '', photo: '', description: '', link: '' }), photo } 
              })}
              previewClassName="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <label className="block text-sm font-medium mb-2">Описание</label>
              <Textarea
                value={page.author?.description || ''}
                onChange={(e) => updatePageContent({ 
                  author: { ...(page.author || { name: '', photo: '', description: '', link: '' }), description: e.target.value } 
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ссылка</label>
              <Input
                value={page.author?.link || ''}
                onChange={(e) => updatePageContent({ 
                  author: { ...(page.author || { name: '', photo: '', description: '', link: '' }), link: e.target.value } 
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Статистика в шапке */}
      {page.blocks.showHeader && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Статистика в шапке</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Подзаголовок</label>
              <Textarea
                value={page.headerStats?.subtitle || ''}
                onChange={(e) => updatePageContent({ 
                  headerStats: { ...(page.headerStats || { reviewsCount: '', badgeText: '', subtitle: '' }), subtitle: e.target.value } 
                })}
                placeholder="Оставьте пустым для использования общего"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Блок перед таблицей */}
      {page.blocks.showBeforeTable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Блок перед таблицей курсов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок</label>
              <Input
                value={page.beforeTableBlock?.title || ''}
                onChange={(e) => updatePageContent({ 
                  beforeTableBlock: { 
                    ...(page.beforeTableBlock || { title: '', paragraphs: [], criteria: [] }), 
                    title: e.target.value 
                  } 
                })}
                placeholder="Оставьте пустым для использования общего"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Параграфы (через Enter)</label>
              <Textarea
                value={(page.beforeTableBlock?.paragraphs || []).join('\n\n')}
                onChange={(e) => updatePageContent({ 
                  beforeTableBlock: { 
                    ...(page.beforeTableBlock || { title: '', paragraphs: [], criteria: [] }), 
                    paragraphs: e.target.value.split('\n\n').filter(s => s.trim()) 
                  } 
                })}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Курсы */}
      {page.blocks.showCoursesList && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Курсы страницы</CardTitle>
                <CardDescription>
                  {page.courses?.length ? `${page.courses.length} курсов` : 'Используется общий список курсов'}
                </CardDescription>
              </div>
              <Button size="sm" onClick={addPageCourse}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить курс
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(page.courses?.length || 0) > 0 ? (
              <Accordion type="single" collapsible className="space-y-2">
                {page.courses?.map((course, courseIndex) => (
                  <AccordionItem key={course.id} value={`course-${courseIndex}`} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{courseIndex + 1}</Badge>
                        <span className="font-medium text-left">{course.title}</span>
                        <Badge variant="secondary">{course.school}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Название курса</label>
                            <Input
                              value={course.title}
                              onChange={(e) => updatePageCourse(courseIndex, 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Школа</label>
                            <Input
                              value={course.school}
                              onChange={(e) => updatePageCourse(courseIndex, 'school', e.target.value)}
                            />
                          </div>
                        </div>

                        <ImageUploader
                          label="Логотип школы"
                          value={course.schoolLogo}
                          onChange={(schoolLogo) => updatePageCourse(courseIndex, 'schoolLogo', schoolLogo)}
                          previewClassName="h-10 w-auto object-contain"
                        />

                        <div>
                          <label className="block text-sm font-medium mb-2">Ссылка на курс</label>
                          <Input
                            value={course.url}
                            onChange={(e) => updatePageCourse(courseIndex, 'url', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Цена (₽)</label>
                            <Input
                              type="number"
                              value={course.price}
                              onChange={(e) => updatePageCourse(courseIndex, 'price', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Формат</label>
                            <Input
                              value={course.format}
                              onChange={(e) => updatePageCourse(courseIndex, 'format', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Длительность</label>
                            <Input
                              value={course.duration}
                              onChange={(e) => updatePageCourse(courseIndex, 'duration', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Особенности курса (одним абзацем)</label>
                          <Textarea
                            value={String(course.features || '')}
                            onChange={(e) => updatePageCourse(courseIndex, 'features', e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Навыки (через Enter)</label>
                          <Textarea
                            value={course.skills.join('\n')}
                            onChange={(e) => updatePageCourse(courseIndex, 'skills', e.target.value.split('\n'))}
                            onBlur={(e) => updatePageCourse(courseIndex, 'skills', e.target.value.split('\n').filter(s => s.trim()))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Преподаватели (через Enter: Имя — Описание)</label>
                          <Textarea
                            value={(course.teachers || []).map(t => `${t.name} — ${t.description}`).join('\n')}
                            onChange={(e) => updatePageCourse(courseIndex, 'teachers', e.target.value.split('\n').map(line => {
                              const parts = line.split('—').map(s => s.trim());
                              return { name: parts[0] || '', description: parts.slice(1).join('—').trim() || '' };
                            }))}
                            onBlur={(e) => updatePageCourse(courseIndex, 'teachers', e.target.value.split('\n').filter(s => s.trim()).map(line => {
                              const parts = line.split('—').map(s => s.trim());
                              return { name: parts[0] || '', description: parts.slice(1).join('—').trim() || '' };
                            }))}
                            className="min-h-[80px]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Программа (через Enter)</label>
                          <Textarea
                            value={(course.program || []).join('\n')}
                            onChange={(e) => updatePageCourse(courseIndex, 'program', e.target.value.split('\n'))}
                            onBlur={(e) => updatePageCourse(courseIndex, 'program', e.target.value.split('\n').filter(s => s.trim()))}
                            className="min-h-[80px]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Преимущества (через Enter)</label>
                          <Textarea
                            value={course.advantages.join('\n')}
                            onChange={(e) => updatePageCourse(courseIndex, 'advantages', e.target.value.split('\n'))}
                            onBlur={(e) => updatePageCourse(courseIndex, 'advantages', e.target.value.split('\n').filter(s => s.trim()))}
                            className="min-h-[60px]"
                          />
                        </div>

                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removePageCourse(courseIndex)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить курс
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Курсы не добавлены. Будет использоваться общий список курсов.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      {page.blocks.showFAQ && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">FAQ страницы</CardTitle>
                <CardDescription>
                  {page.faqData?.length ? `${page.faqData.length} вопросов` : 'Используется общий FAQ'}
                </CardDescription>
              </div>
              <Button size="sm" onClick={addPageFAQ}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить вопрос
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(page.faqData?.length || 0) > 0 ? (
              <Accordion type="single" collapsible className="space-y-2">
                {page.faqData?.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`faq-${faqIndex}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="text-left">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Вопрос</label>
                        <Input
                          value={faq.question}
                          onChange={(e) => updatePageFAQ(faqIndex, 'question', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Ответ</label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updatePageFAQ(faqIndex, 'answer', e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removePageFAQ(faqIndex)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Вопросы не добавлены. Будет использоваться общий FAQ.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Текстовые блоки */}
      {page.blocks.showContentBlocks && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Текстовые блоки</CardTitle>
                <CardDescription>
                  {page.contentBlocks?.length ? `${page.contentBlocks.length} блоков` : 'Используются общие блоки'}
                </CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={() => {
                  const newBlock: ContentBlock = { title: 'Новый блок', paragraphs: [], list: [] };
                  updatePageContent({ contentBlocks: [...(page.contentBlocks || []), newBlock] });
                  toast.success('Блок добавлен');
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить блок
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(page.contentBlocks?.length || 0) > 0 ? (
              <Accordion type="single" collapsible className="space-y-2">
                {page.contentBlocks?.map((block, blockIndex) => (
                  <AccordionItem key={blockIndex} value={`block-${blockIndex}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="text-left">{block.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Заголовок</label>
                        <Input
                          value={block.title}
                          onChange={(e) => {
                            const blocks = [...(page.contentBlocks || [])];
                            blocks[blockIndex] = { ...blocks[blockIndex], title: e.target.value };
                            updatePageContent({ contentBlocks: blocks });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Параграфы</label>
                        <Textarea
                          value={(block.paragraphs || []).join('\n\n')}
                          onChange={(e) => {
                            const blocks = [...(page.contentBlocks || [])];
                            blocks[blockIndex] = { 
                              ...blocks[blockIndex], 
                              paragraphs: e.target.value.split('\n\n').filter(s => s.trim()) 
                            };
                            updatePageContent({ contentBlocks: blocks });
                          }}
                          className="min-h-[80px]"
                        />
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          const blocks = (page.contentBlocks || []).filter((_, i) => i !== blockIndex);
                          updatePageContent({ contentBlocks: blocks });
                          toast.success('Блок удалён');
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить блок
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Блоки не добавлены. Будут использоваться общие текстовые блоки.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
