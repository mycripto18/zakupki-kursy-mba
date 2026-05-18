import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, Settings, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'admin_password';
const SESSION_KEY = 'admin_authenticated';
const LOCKOUT_KEY = 'admin_lockout';
const ATTEMPTS_KEY = 'admin_attempts';
const DEFAULT_PASSWORD = 'admin123';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 минут

interface AdminAuthProps {
  children: React.ReactNode;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Проверяем сессию
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'true') {
      setIsAuthenticated(true);
    }
    
    // Проверяем блокировку
    checkLockout();
    
    // Загружаем количество попыток
    const savedAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
    setAttempts(savedAttempts);
  }, []);

  useEffect(() => {
    // Таймер для обновления времени блокировки
    if (isLocked) {
      const interval = setInterval(() => {
        checkLockout();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLocked]);

  const checkLockout = () => {
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
    const now = Date.now();
    
    if (lockoutUntil > now) {
      setIsLocked(true);
      setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
    } else {
      if (isLocked) {
        // Сброс после окончания блокировки
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
        setAttempts(0);
      }
      setIsLocked(false);
      setLockoutRemaining(0);
    }
  };

  const getStoredPassword = () => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_PASSWORD;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error('Слишком много попыток. Подождите.');
      return;
    }
    
    const storedPassword = getStoredPassword();
    
    if (password === storedPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      setAttempts(0);
      toast.success('Вход выполнен успешно');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem(ATTEMPTS_KEY, String(newAttempts));
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem(LOCKOUT_KEY, String(lockoutUntil));
        setIsLocked(true);
        setLockoutRemaining(Math.ceil(LOCKOUT_DURATION / 1000));
        toast.error(`Аккаунт заблокирован на 15 минут`);
      } else {
        toast.error(`Неверный пароль. Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(SESSION_KEY);
    setPassword('');
    toast.success('Вы вышли из админки');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 4) {
      toast.error('Пароль должен быть не менее 4 символов');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    
    localStorage.setItem(STORAGE_KEY, newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setShowSettings(false);
    toast.success('Пароль успешно изменён');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isLocked ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              {isLocked ? (
                <AlertTriangle className="w-6 h-6 text-destructive" />
              ) : (
                <Lock className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardTitle>{isLocked ? 'Доступ заблокирован' : 'Вход в панель управления'}</CardTitle>
            <CardDescription>
              {isLocked 
                ? `Слишком много неудачных попыток. Подождите ${formatTime(lockoutRemaining)}`
                : 'Введите пароль для доступа'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="pr-10"
                  autoFocus
                  disabled={isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLocked}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={isLocked}>
                {isLocked ? `Заблокировано (${formatTime(lockoutRemaining)})` : 'Войти'}
              </Button>
            </form>
            {attempts > 0 && !isLocked && (
              <p className="text-xs text-destructive text-center mt-4">
                Неудачных попыток: {attempts} из {MAX_ATTEMPTS}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Logout и Settings кнопки */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          <Lock className="w-4 h-4 mr-2" />
          Выйти
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Изменить пароль</CardTitle>
              <CardDescription>
                Установите новый пароль для админ-панели
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Новый пароль</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Минимум 4 символа"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Подтвердите пароль</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                    Отмена
                  </Button>
                  <Button type="submit" className="flex-1">
                    Сохранить
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {children}
    </div>
  );
};
