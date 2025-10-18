import { Moon, Sun, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  children?: React.ReactNode;
}

export default function AdminPageHeader({ title, description, onRefresh, children }: AdminPageHeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            data-testid="button-refresh"
            className="border-gray-300 dark:border-gray-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 transition-transform duration-1000 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDarkMode}
          data-testid="button-toggle-dark-mode"
          className="border-gray-300 dark:border-gray-600"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        {children}
      </div>
    </div>
  );
}
