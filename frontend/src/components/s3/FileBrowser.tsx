import { useState, useMemo, useEffect, useRef } from 'react';
import { S3Object, ViewMode, BreadcrumbItem } from '@/types/s3';
import { Breadcrumbs } from './Breadcrumbs';
import { FileGrid } from './FileGrid';
import { FileList } from './FileList';
import { FilePreview } from './FilePreview';
import { s3Api } from '@/lib/api';
import { Grid3X3, List, Search, RefreshCw, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

interface FileBrowserProps {
  bucket: string;
  onGoHome?: () => void;
}

export const FileBrowser = ({ bucket, onGoHome }: FileBrowserProps) => {
  const [currentPath, setCurrentPath] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedObject, setSelectedObject] = useState<S3Object | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchObjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedObjects = await s3Api.listObjects(bucket, currentPath);
      setObjects(fetchedObjects);
    } catch (err) {
      console.error('Failed to fetch objects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load objects');
      setObjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, [bucket, currentPath]);

  // Reset path when bucket changes
  useEffect(() => {
    setCurrentPath('');
    setSelectedObject(null);
  }, [bucket]);

  const filteredObjects = useMemo(() => {
    if (!searchQuery) return objects;
    return objects.filter(obj =>
      obj.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [objects, searchQuery]);

  // Reset focused index when objects change
  useEffect(() => {
    setFocusedIndex(0);
  }, [filteredObjects]);

  // Focus container on mount and when files load
  useEffect(() => {
    if (containerRef.current && filteredObjects.length > 0) {
      containerRef.current.focus();
    }
  }, [filteredObjects.length]);

  // Keyboard navigation - using window events to ensure they're always captured
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Only handle if there are objects to navigate
      if (filteredObjects.length === 0) return;

      const maxIndex = filteredObjects.length - 1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setFocusedIndex(prev => Math.min(prev + 1, maxIndex));
          break;

        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;

        case 'ArrowRight':
          if (viewMode === 'grid') {
            e.preventDefault();
            e.stopPropagation();
            setFocusedIndex(prev => Math.min(prev + 1, maxIndex));
          }
          break;

        case 'ArrowLeft':
          if (viewMode === 'grid') {
            e.preventDefault();
            e.stopPropagation();
            setFocusedIndex(prev => Math.max(prev - 1, 0));
          }
          break;

        case 'Home':
          e.preventDefault();
          e.stopPropagation();
          setFocusedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          e.stopPropagation();
          setFocusedIndex(maxIndex);
          break;

        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          if (filteredObjects[focusedIndex]) {
            const obj = filteredObjects[focusedIndex];
            if (obj.type === 'folder') {
              const newPath = obj.key.replace(bucket + '/', '');
              setCurrentPath(newPath);
              setSelectedObject(null);
            } else {
              setSelectedObject(obj);
            }
          }
          break;

        case 'Backspace':
          e.preventDefault();
          e.stopPropagation();
          if (currentPath) {
            const pathParts = currentPath.split('/').filter(Boolean);
            pathParts.pop();
            const newPath = pathParts.length > 0 ? pathParts.join('/') + '/' : '';
            setCurrentPath(newPath);
            setSelectedObject(null);
          }
          break;

        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          if (selectedObject) {
            setSelectedObject(null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredObjects, focusedIndex, currentPath, bucket, selectedObject, viewMode]);

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    if (!currentPath) return [];

    const parts = currentPath.split('/').filter(Boolean);
    return parts.map((part, index) => ({
      label: part,
      path: parts.slice(0, index + 1).join('/') + '/',
    }));
  }, [currentPath]);

  const handleObjectClick = (obj: S3Object) => {
    if (obj.type === 'folder') {
      const newPath = obj.key.replace(bucket + '/', '');
      setCurrentPath(newPath);
      setSelectedObject(null);
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSelectedObject(null);
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="flex-1 flex h-full overflow-hidden outline-none"
    >
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={selectedObject ? 65 : 100} minSize={5}>
          <div className="flex-1 flex flex-col h-full min-w-0">
            {/* Toolbar */}
            <header className="p-4 border-b border-border bg-card/50">
              <div className="flex items-center justify-between gap-4">
                <Breadcrumbs
                  items={[{ label: bucket, path: '' }, ...breadcrumbs]}
                  onNavigate={handleNavigate}
                  onGoHome={onGoHome}
                />

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 pl-9 pr-8 py-1.5 bg-secondary rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted-foreground/20 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center bg-secondary rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        viewMode === 'grid' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        viewMode === 'list' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={fetchObjects}
                    disabled={isLoading}
                  >
                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </header>

            {/* File List/Grid */}
            <main className="flex-1 overflow-y-auto scrollbar-thin bg-background">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-lg font-medium">Loading objects...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-lg font-medium text-destructive">Error loading objects</p>
                  <p className="text-sm">{error}</p>
                  <Button onClick={fetchObjects} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : filteredObjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium">No files found</p>
                  <p className="text-sm">This folder is empty or no files match your search</p>
                </div>
              ) : viewMode === 'grid' ? (
                <FileGrid
                  objects={filteredObjects}
                  onObjectClick={handleObjectClick}
                  onObjectSelect={setSelectedObject}
                  selectedObject={selectedObject}
                  focusedIndex={focusedIndex}
                />
              ) : (
                <FileList
                  objects={filteredObjects}
                  onObjectClick={handleObjectClick}
                  onObjectSelect={setSelectedObject}
                  selectedObject={selectedObject}
                  focusedIndex={focusedIndex}
                />
              )}
            </main>

            {/* Status Bar */}
            <footer className="px-4 py-2 border-t border-border bg-card/50 text-xs text-muted-foreground flex items-center justify-between">
              <span>{filteredObjects.length} items</span>
              <span>{filteredObjects.filter(o => o.type === 'folder').length} folders, {filteredObjects.filter(o => o.type === 'file').length} files</span>
            </footer>
          </div>
        </ResizablePanel>

        {/* Preview Panel */}
        {selectedObject && selectedObject.type === 'file' && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={5}>
              <FilePreview
                object={selectedObject}
                bucket={bucket}
                onClose={() => setSelectedObject(null)}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
