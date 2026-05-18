import React, { useRef, useState, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  previewClassName?: string;
  accept?: string;
  maxSizeMB?: number;
  maxWidth?: number;
  quality?: number;
}

// Функция сжатия изображения
const compressImage = (
  file: File, 
  maxWidth: number = 1600, 
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Пропорциональное уменьшение
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error('Canvas context error'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Определяем формат: JPEG для фото, PNG для изображений с прозрачностью
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const finalQuality = mimeType === 'image/png' ? 1 : quality;
      
      const compressedBase64 = canvas.toDataURL(mimeType, finalQuality);
      
      // Логируем сжатие
      const originalSizeKB = Math.round(file.size / 1024);
      const compressedSizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
      console.log(`Сжатие: ${originalSizeKB}KB → ${compressedSizeKB}KB (${Math.round((1 - compressedSizeKB/originalSizeKB) * 100)}% экономии)`);
      
      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
    img.src = URL.createObjectURL(file);
  });
};

export const ImageUploader = forwardRef<HTMLDivElement, ImageUploaderProps>(({
  value,
  onChange,
  label = 'Изображение',
  previewClassName = 'w-20 h-20 object-cover rounded-lg',
  accept = 'image/*',
  maxSizeMB = 10,
  maxWidth = 1600,
  quality = 0.85
}, ref) => {
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [urlInput, setUrlInput] = useState(value?.startsWith('data:') ? '' : value || '');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера (до сжатия)
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Файл слишком большой. Максимум ${maxSizeMB}MB`);
      return;
    }

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImage(file, maxWidth, quality);
      onChange(compressedBase64);
      toast.success('Изображение сжато и загружено');
    } catch (error) {
      toast.error('Ошибка при обработке изображения');
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url);
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={mode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('url')}
          >
            <Link className="w-3 h-3 mr-1" />
            URL
          </Button>
          <Button
            type="button"
            variant={mode === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('file')}
          >
            <Upload className="w-3 h-3 mr-1" />
            Файл
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-2">
          {mode === 'url' ? (
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          ) : (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={isCompressing}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isCompressing ? 'Сжатие...' : `Выбрать файл (авто-сжатие до ${maxWidth}px)`}
              </Button>
            </div>
          )}
          
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-3 h-3 mr-1" />
              Удалить
            </Button>
          )}
        </div>

        {/* Preview */}
        <div className="flex-shrink-0">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className={previewClassName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Error';
              }}
            />
          ) : (
            <div className={`${previewClassName} bg-muted flex items-center justify-center border border-dashed border-muted-foreground/25`}>
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {value?.startsWith('data:') && (
        <p className="text-xs text-muted-foreground">
          ✓ Изображение встроено в данные (base64)
        </p>
      )}
    </div>
  );
});

ImageUploader.displayName = 'ImageUploader';
