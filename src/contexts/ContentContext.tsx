import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Типы контента
export interface Teacher {
  name: string;
  description: string;
}

export interface ReviewLink {
  platform: string;
  count: string;
  rating: string;
  url: string;
}

export interface PromoCode {
  code: string;
  discountText: string;
  discountPercent: number;
}

export interface Course {
  id: number;
  title: string;
  school: string;
  schoolLogo: string;
  url: string;
  price: number;
  oldPrice?: number;
  installment?: number;
  format: string;
  duration: string;
  document: string;
  forWhom: string;
  features: string;
  skills: string[];
  teachers?: Teacher[];
  program?: string[];
  advantages: string[];
  reviews: string;
  reviewLinks?: ReviewLink[];
  promoCode?: PromoCode;
  discount?: string;
  badge?: 'top' | 'popular' | 'new';
}

export interface ContentBlockItem {
  icon: string;
  text: string;
}

export interface ContentBlock {
  title: string;
  paragraphs?: string[];
  list?: ContentBlockItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CriteriaItem {
  icon: string;
  text: string;
}

export interface BeforeTableBlock {
  title: string;
  paragraphs: string[];
  criteria: CriteriaItem[];
}

export interface Author {
  name: string;
  photo: string;
  description: string;
  link: string;
}

export interface MetaData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
}

export interface HeaderStats {
  reviewsCount: string;
  badgeText: string;
  subtitle: string;
}

// Настройки видимости блоков на странице
export interface PageBlocks {
  showHeader: boolean;
  showAuthor: boolean;
  showIntro: boolean;
  showBeforeTable: boolean;
  showCoursesList: boolean;
  showCourseDetails: boolean;
  showContentBlocks: boolean;
  showFAQ: boolean;
}

// Навигационная ссылка
export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

// Ссылка в футере
export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

// Секция правовой страницы
export interface LegalSection {
  title: string;
  content: string;
}

// Правовая страница (политика, условия и т.д.)
export interface LegalPage {
  id: string;
  slug: string;
  title: string;
  sections: LegalSection[];
  showInFooter: boolean;
}

// Дополнительная страница
export interface SitePage {
  id: string;
  slug: string;
  title: string;
  menuLabel: string;
  showInMenu: boolean;
  metaData: MetaData;
  blocks: PageBlocks;
  // Контент страницы (может быть свой или общий)
  pageTitle?: string;
  author?: Author;
  headerStats?: HeaderStats;
  introText?: string;
  beforeTableBlock?: BeforeTableBlock;
  courses?: Course[];
  contentBlocks?: ContentBlock[];
  faqData?: FAQItem[];
}

export interface SiteContent {
  pageTitle: string;
  metaData: MetaData;
  author: Author;
  headerStats: HeaderStats;
  introText: string;
  beforeTableBlock: BeforeTableBlock;
  courses: Course[];
  contentBlocks: ContentBlock[];
  faqData: FAQItem[];
  // Дополнительные страницы
  pages: SitePage[];
  // Навигация
  navigation: NavItem[];
  // Дата обновления (YYYY-MM-DD)
  updatedAt: string;
  // Рекламная пометка
  adDisclosureText: string;
  // Футер
  footerText: string;
  footerEmail: string;
  footerLinks: FooterLink[];
  // Правовые страницы
  legalPages: LegalPage[];
}

const STORAGE_KEY = 'site-content-data';
const REFRESH_KEY = 'site-content-refresh';
const CONTENT_JSON_URL = '/content.json';

// Получить дефолтный контент (пустой, реальные данные загружаются из content.json)
const getDefaultContent = (): SiteContent => ({
  pageTitle: '',
  metaData: { title: '', description: '', keywords: '', canonicalUrl: '' },
  author: { name: '', photo: '', description: '', link: '' },
  headerStats: { reviewsCount: '0', badgeText: '', subtitle: '' },
  introText: '',
  beforeTableBlock: { title: '', paragraphs: [], criteria: [] },
  courses: [],
  contentBlocks: [],
  faqData: [],
  pages: [],
  navigation: [
    { label: "Главная", href: "/" },
    { label: "Курсы", href: "#courses" },
  ],
  updatedAt: '',
  adDisclosureText: 'Реклама. Информация о рекламодателе по ссылкам в статье.',
  footerText: 'Интернет-сайт носит информационный характер и ни при каких условиях не является публичной офертой.',
  footerEmail: 'info@example.com',
  footerLinks: [],
  legalPages: [
    {
      id: 'privacy',
      slug: 'privacy',
      title: 'Политика конфиденциальности',
      showInFooter: true,
      sections: [
        { title: '1. Общие положения', content: 'Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта.\n\nИспользование сайта означает согласие пользователя с настоящей Политикой конфиденциальности и условиями обработки персональных данных.' },
        { title: '2. Персональные данные', content: 'Мы можем собирать следующие данные:\n• Техническая информация (IP-адрес, тип браузера, время посещения)\n• Данные из cookies и аналитических систем\n• Информация, предоставленная пользователем добровольно через формы обратной связи' },
        { title: '3. Цели обработки данных', content: 'Персональные данные обрабатываются в следующих целях:\n• Улучшение качества работы сайта\n• Анализ посещаемости и поведения пользователей\n• Обратная связь с пользователями' },
        { title: '4. Защита данных', content: 'Мы принимаем необходимые технические и организационные меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.' },
        { title: '5. Cookies', content: 'Сайт использует файлы cookies для обеспечения корректной работы и сбора аналитических данных. Вы можете отключить cookies в настройках браузера.' },
        { title: '6. Контактная информация', content: 'По вопросам, связанным с обработкой персональных данных, вы можете связаться с нами по электронной почте.' },
        { title: '7. Изменения политики', content: 'Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. Актуальная версия всегда доступна на данной странице.' },
      ],
    },
  ],
});

// Загрузить контент из public/content.json
const loadContentFromJSON = async (): Promise<SiteContent | null> => {
  try {
    // Важно: принудительно отключаем HTTP-кэш (особенно заметно на моб. браузерах)
    const response = await fetch(CONTENT_JSON_URL + '?t=' + Date.now(), {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = await response.json();
    return { ...getDefaultContent(), ...data };
  } catch (e) {
    console.error('Ошибка загрузки content.json:', e);
    return null;
  }
};


interface ContentContextType {
  content: SiteContent;
  setContent: (content: SiteContent) => void;
  updateContent: (updates: Partial<SiteContent>) => void;
  resetToDefault: () => void;
  exportJSON: (pageSlug?: string) => string;
  importJSON: (json: string, pageSlug?: string) => boolean;
  saveNow: () => boolean;
  isModified: boolean;
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContentState] = useState<SiteContent>(getDefaultContent());
  const [savedContent, setSavedContent] = useState<SiteContent>(getDefaultContent());
  const [isLoading, setIsLoading] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Загрузка контента при старте
  useEffect(() => {
    const isAdminPage = window.location.pathname.includes('panel-x7k9m2');
    setIsAdmin(isAdminPage);
    
    const loadContent = async () => {
      if (isAdminPage) {
        // В админке загружаем из localStorage для редактирования
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = { ...getDefaultContent(), ...JSON.parse(saved) };
            setContentState(parsed);
            setSavedContent(parsed);
          } else {
            // Загружаем из content.json как начальные данные
            const jsonContent = await loadContentFromJSON();
            if (jsonContent) {
              setContentState(jsonContent);
              setSavedContent(jsonContent);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(jsonContent));
            }
          }
        } catch (e) {
          console.error('Ошибка загрузки контента:', e);
        }
      } else {
        // На публичных страницах загружаем из content.json
        const jsonContent = await loadContentFromJSON();
        if (jsonContent) {
          setContentState(jsonContent);
          setSavedContent(jsonContent);
        }
      }
      setIsLoading(false);
    };
    
    loadContent();
  }, []);


  // Синхронизация между вкладками/предпросмотром (iframe) - только сохраненный контент
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== REFRESH_KEY) return;
      // Только на НЕ-админских страницах обновляем контент автоматически
      if (window.location.pathname.includes('panel-x7k9m2')) return;
      
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          setContentState(getDefaultContent());
          setSavedContent(getDefaultContent());
          return;
        }
        const parsed = JSON.parse(saved);
        const merged = { ...getDefaultContent(), ...parsed };
        setContentState(merged);
        setSavedContent(merged);
      } catch (err) {
        console.error('Ошибка синхронизации контента:', err);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Отслеживаем изменения (сравниваем с сохранённым контентом)
  useEffect(() => {
    const savedStr = JSON.stringify(savedContent);
    const currentStr = JSON.stringify(content);
    setIsModified(savedStr !== currentStr);
  }, [content, savedContent]);

  const setContent = (newContent: SiteContent) => {
    setContentState(newContent);
  };

  const updateContent = (updates: Partial<SiteContent>) => {
    setContentState(prev => ({ ...prev, ...updates }));
  };

  const resetToDefault = () => {
    const defaultContent = getDefaultContent();
    setContentState(defaultContent);
    localStorage.removeItem(STORAGE_KEY);
  };

const exportJSON = (pageSlug?: string): string => {
    if (pageSlug === 'full') {
      // Экспорт всего сайта (для content.json)
      return JSON.stringify(content, null, 2);
    } else if (pageSlug === 'main' || !pageSlug) {
      // Экспорт главной страницы (без pages и navigation)
      const { pages, navigation, ...mainContent } = content;
      return JSON.stringify(mainContent, null, 2);
    } else {
      // Экспорт конкретной страницы
      const page = content.pages.find(p => p.slug === pageSlug);
      if (page) {
        return JSON.stringify(page, null, 2);
      }
      return JSON.stringify(content, null, 2);
    }
  };

  // Функция для сохранения существующих изображений при импорте
  const mergeCoursesWithExistingImages = (newCourses: Course[], existingCourses: Course[]): Course[] => {
    return newCourses.map(newCourse => {
      const existingCourse = existingCourses.find(c => c.id === newCourse.id);
      if (!existingCourse) return newCourse;
      
      return {
        ...newCourse,
        // Сохраняем существующий schoolLogo если новый пустой
        schoolLogo: newCourse.schoolLogo || existingCourse.schoolLogo || '',
      };
    });
  };

  const mergeAuthorWithExistingImage = (newAuthor: Author, existingAuthor: Author): Author => {
    return {
      ...newAuthor,
      // Сохраняем существующее фото если новое пустое
      photo: newAuthor.photo || existingAuthor.photo || '',
    };
  };

  const importJSON = (json: string, pageSlug?: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      
      if (pageSlug === 'full') {
        // Импорт всего сайта (полный content.json)
        if (!parsed.pageTitle && !parsed.pages) {
          throw new Error('Неверная структура JSON для полного сайта');
        }
        
        // Мержим курсы с сохранением существующих изображений
        const mergedCourses = parsed.courses 
          ? mergeCoursesWithExistingImages(parsed.courses, content.courses)
          : content.courses;
        
        // Мержим автора с сохранением фото
        const mergedAuthor = parsed.author 
          ? mergeAuthorWithExistingImage(parsed.author, content.author)
          : content.author;
        
        // Мержим страницы с сохранением изображений
        const mergedPages = parsed.pages 
          ? parsed.pages.map((newPage: SitePage) => {
              const existingPage = content.pages.find(p => p.slug === newPage.slug);
              if (!existingPage) return newPage;
              
              return {
                ...newPage,
                courses: newPage.courses 
                  ? mergeCoursesWithExistingImages(newPage.courses, existingPage.courses || [])
                  : existingPage.courses,
                author: newPage.author && existingPage.author
                  ? mergeAuthorWithExistingImage(newPage.author, existingPage.author)
                  : newPage.author || existingPage.author,
              };
            })
          : content.pages;
        
        setContentState({ 
          ...getDefaultContent(), 
          ...parsed, 
          courses: mergedCourses,
          author: mergedAuthor,
          pages: mergedPages,
        });
      } else if (pageSlug === 'main' || !pageSlug) {
        // Импорт на главную страницу
        if (!parsed.pageTitle || !parsed.metaData || !parsed.courses) {
          throw new Error('Неверная структура JSON для главной страницы');
        }
        
        // Мержим курсы и автора с сохранением изображений
        const mergedCourses = mergeCoursesWithExistingImages(parsed.courses, content.courses);
        const mergedAuthor = parsed.author 
          ? mergeAuthorWithExistingImage(parsed.author, content.author)
          : content.author;
        
        // Сохраняем pages и navigation
        setContentState({ 
          ...getDefaultContent(), 
          ...parsed, 
          courses: mergedCourses,
          author: mergedAuthor,
          pages: content.pages, 
          navigation: content.navigation 
        });
      } else {
        // Импорт на конкретную страницу
        const pageIndex = content.pages.findIndex(p => p.slug === pageSlug);
        if (pageIndex === -1) {
          throw new Error('Страница не найдена');
        }
        
        const existingPage = content.pages[pageIndex];
        
        // Проверяем, это полная страница или контент
        if (parsed.slug && parsed.blocks) {
          // Это полная страница
          const newPages = [...content.pages];
          
          // Мержим курсы с сохранением изображений
          const mergedCourses = parsed.courses 
            ? mergeCoursesWithExistingImages(parsed.courses, existingPage.courses || [])
            : existingPage.courses;
          
          const mergedAuthor = parsed.author && existingPage.author
            ? mergeAuthorWithExistingImage(parsed.author, existingPage.author)
            : parsed.author || existingPage.author;
          
          newPages[pageIndex] = { 
            ...newPages[pageIndex], 
            ...parsed, 
            slug: pageSlug,
            courses: mergedCourses,
            author: mergedAuthor,
          };
          setContentState({ ...content, pages: newPages });
        } else if (parsed.pageTitle || parsed.courses) {
          // Это контент как на главной, применяем к странице
          const newPages = [...content.pages];
          
          // Мержим курсы с сохранением изображений
          const mergedCourses = parsed.courses 
            ? mergeCoursesWithExistingImages(parsed.courses, existingPage.courses || [])
            : existingPage.courses || [];
          
          const mergedAuthor = parsed.author && existingPage.author
            ? mergeAuthorWithExistingImage(parsed.author, existingPage.author)
            : parsed.author || existingPage.author;
          
          // Если есть metaData в JSON - полностью заменяем, иначе мержим поля
          const newMetaData = parsed.metaData ? {
            title: parsed.metaData.title || newPages[pageIndex].metaData.title,
            description: parsed.metaData.description || newPages[pageIndex].metaData.description,
            keywords: parsed.metaData.keywords || newPages[pageIndex].metaData.keywords,
            canonicalUrl: parsed.metaData.canonicalUrl || newPages[pageIndex].metaData.canonicalUrl
          } : newPages[pageIndex].metaData;
          
          newPages[pageIndex] = {
            ...newPages[pageIndex],
            pageTitle: parsed.pageTitle || newPages[pageIndex].pageTitle,
            author: mergedAuthor,
            headerStats: parsed.headerStats || newPages[pageIndex].headerStats,
            introText: parsed.introText || newPages[pageIndex].introText,
            beforeTableBlock: parsed.beforeTableBlock || newPages[pageIndex].beforeTableBlock,
            courses: mergedCourses,
            contentBlocks: parsed.contentBlocks || newPages[pageIndex].contentBlocks,
            faqData: parsed.faqData || newPages[pageIndex].faqData,
            metaData: newMetaData
          };
          setContentState({ ...content, pages: newPages });
        } else {
          throw new Error('Неверная структура JSON');
        }
      }
      return true;
    } catch (e) {
      console.error('Ошибка импорта JSON:', e);
      return false;
    }
  };

  const saveNow = (): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      localStorage.setItem(REFRESH_KEY, String(Date.now()));
      setSavedContent(content); // Обновляем сохранённую версию
      setIsModified(false);
      return true;
    } catch (e) {
      console.error('Ошибка сохранения контента:', e);
      return false;
    }
  };

  return (
    <ContentContext.Provider value={{
      content,
      setContent,
      updateContent,
      resetToDefault,
      exportJSON,
      importJSON,
      saveNow,
      isModified,
      isLoading
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
