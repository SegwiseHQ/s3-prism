import { useEffect, useState, useCallback, useRef } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { S3Bucket } from '@/types/s3';
import { HardDrive, Clock, Search as SearchIcon } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  buckets: S3Bucket[];
  selectedBucket: string | null;
  onSelectBucket: (bucket: string) => void;
}

interface RecentBucket {
  name: string;
  timestamp: number;
}

const MAX_RECENT_ITEMS = 5;

export const CommandPalette = ({ buckets, selectedBucket, onSelectBucket }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recentBuckets, setRecentBuckets] = useState<RecentBucket[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent buckets from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('s3-prism-recent-buckets');
    if (stored) {
      try {
        setRecentBuckets(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent buckets:', e);
      }
    }
  }, []);

  // Save recent bucket to localStorage
  const addRecentBucket = useCallback((bucketName: string) => {
    setRecentBuckets((prev) => {
      const filtered = prev.filter((b) => b.name !== bucketName);
      const newItems = [{ name: bucketName, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_ITEMS);
      localStorage.setItem('s3-prism-recent-buckets', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Clear search when closing
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  // Scroll to top when search is cleared
  useEffect(() => {
    if (!search && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [search]);

  const handleSelectBucket = useCallback(
    (bucketName: string) => {
      onSelectBucket(bucketName);
      addRecentBucket(bucketName);
      setOpen(false);
    },
    [onSelectBucket, addRecentBucket]
  );

  // Format bucket metadata, hiding unhelpful values
  const formatBucketMetadata = useCallback((bucket: S3Bucket) => {
    const parts: string[] = [];

    // Only show size if it's greater than 0
    if (bucket.size > 0) {
      parts.push(formatFileSize(bucket.size));
    }

    // Only show region if it's not 'unknown' or empty
    if (bucket.region && bucket.region.toLowerCase() !== 'unknown') {
      parts.push(bucket.region);
    }

    // Only show object count if it's greater than 0
    if (bucket.objectCount > 0) {
      parts.push(`${bucket.objectCount} object${bucket.objectCount === 1 ? '' : 's'}`);
    }

    return parts.length > 0 ? parts.join(' · ') : null;
  }, []);

  // Filter buckets based on search
  const filteredBuckets = buckets.filter((bucket) =>
    bucket.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter recent buckets based on search
  const filteredRecentBuckets = recentBuckets
    .filter((item) => {
      // Only show recent buckets that still exist
      const bucketExists = buckets.some((b) => b.name === item.name);
      return bucketExists && item.name.toLowerCase().includes(search.toLowerCase());
    });

  const hasResults = filteredBuckets.length > 0 || filteredRecentBuckets.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search S3 buckets..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList ref={listRef} className="max-h-[400px]">
        {!hasResults && (
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <SearchIcon className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-foreground font-medium">No buckets found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? `No results for "${search}"` : 'Try searching for a bucket name'}
              </p>
            </div>
          </CommandEmpty>
        )}

        {/* Recent Buckets */}
        {!search && filteredRecentBuckets.length > 0 && (
          <CommandGroup heading="Recent">
            {filteredRecentBuckets.map((item, idx) => {
              const bucket = buckets.find((b) => b.name === item.name);
              if (!bucket) return null;

              const metadata = formatBucketMetadata(bucket);

              return (
                <CommandItem
                  key={`recent-${idx}`}
                  value={`recent-${item.name}`}
                  onSelect={() => handleSelectBucket(item.name)}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    selectedBucket === bucket.name
                      ? 'bg-primary/20 text-primary'
                      : 'bg-accent text-foreground'
                  )}>
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-foreground">{bucket.name}</div>
                    {metadata ? (
                      <div className="text-xs text-muted-foreground">{metadata}</div>
                    ) : (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Recently accessed
                      </div>
                    )}
                  </div>
                  {selectedBucket === bucket.name && (
                    <div className="text-xs text-primary font-medium">Selected</div>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Buckets */}
        {filteredBuckets.length > 0 && (
          <CommandGroup heading="All Buckets">
            {filteredBuckets.map((bucket) => {
              const metadata = formatBucketMetadata(bucket);

              return (
                <CommandItem
                  key={bucket.name}
                  value={bucket.name}
                  onSelect={() => handleSelectBucket(bucket.name)}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      selectedBucket === bucket.name
                        ? 'bg-primary/20 text-primary'
                        : 'bg-accent text-foreground'
                    )}
                  >
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-foreground">{bucket.name}</div>
                    {metadata && (
                      <div className="text-xs text-muted-foreground">{metadata}</div>
                    )}
                  </div>
                  {selectedBucket === bucket.name && (
                    <div className="text-xs text-primary font-medium">Selected</div>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};
