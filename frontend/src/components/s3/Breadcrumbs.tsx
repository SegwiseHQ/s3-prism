import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/types/s3';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
  onGoHome?: () => void;
}

export const Breadcrumbs = ({ items, onNavigate, onGoHome }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        onClick={() => onGoHome ? onGoHome() : onNavigate('')}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
      >
        <Home className="w-4 h-4" />
      </button>

      {items.map((item, index) => (
        <div key={item.path} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          <button
            onClick={() => onNavigate(item.path)}
            className={`px-2 py-1 rounded transition-colors ${index === items.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
};
