import { Database, HardDrive, Search, X, LogOut } from 'lucide-react';
import { S3Bucket } from '@/types/s3';
import { formatFileSize } from '@/utils/fileUtils';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface BucketSidebarProps {
  buckets: S3Bucket[];
  selectedBucket: string | null;
  onSelectBucket: (bucket: string) => void;
  onClearSelection?: () => void;
}

export const BucketSidebar = ({ buckets, selectedBucket, onSelectBucket, onClearSelection }: BucketSidebarProps) => {
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();

  const filteredBuckets = buckets.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className="w-full h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">S3 Explorer</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search buckets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-sidebar-accent rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                if (onClearSelection) onClearSelection();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
          Buckets ({filteredBuckets.length})
        </div>

        <nav className="space-y-1">
          {filteredBuckets.map((bucket) => (
            <button
              key={bucket.name}
              onClick={() => onSelectBucket(bucket.name)}
              className={cn(
                'sidebar-item w-full text-left',
                selectedBucket === bucket.name && 'sidebar-item-active'
              )}
            >
              <HardDrive className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{bucket.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(bucket.size)} · {bucket.region}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="text-xs text-muted-foreground">
          {buckets.length} buckets · {formatFileSize(buckets.reduce((acc, b) => acc + b.size, 0))} total
        </div>

        {user && (
          <div className="flex items-center gap-2 pt-2 border-t border-sidebar-border">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                {user.name?.charAt(0) || user.email?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

