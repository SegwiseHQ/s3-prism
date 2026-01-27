import { S3Object } from '@/types/s3';
import { FileIcon } from './FileIcon';
import { getFileCategory, formatFileSize, formatDate } from '@/utils/fileUtils';
import { ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface FileListProps {
  objects: S3Object[];
  onObjectClick: (obj: S3Object) => void;
  onObjectSelect: (obj: S3Object) => void;
  selectedObject: S3Object | null;
  focusedIndex: number;
}

export const FileList = ({ objects, onObjectClick, onObjectSelect, selectedObject, focusedIndex }: FileListProps) => {
  const focusedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to focused item
  useEffect(() => {
    if (focusedRef.current) {
      focusedRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
      });
    }
  }, [focusedIndex]);
  const handleClick = (obj: S3Object) => {
    if (obj.type === 'folder') {
      onObjectClick(obj);
    } else {
      onObjectSelect(obj);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-3">Modified</div>
        <div className="col-span-1"></div>
      </div>

      <div className="divide-y divide-border/50">
        {objects.map((obj, index) => {
          const category = obj.type === 'folder' ? 'folder' : getFileCategory(obj.contentType, obj.name);
          const isSelected = selectedObject?.key === obj.key;
          const isFocused = focusedIndex === index;

          return (
            <div
              key={obj.key}
              ref={isFocused ? focusedRef : null}
              onClick={() => handleClick(obj)}
              className={`file-list-item grid grid-cols-12 gap-4 items-center ${isSelected ? 'bg-primary/10' : ''} ${isFocused ? '!bg-secondary/50 border-l-4 border-primary/50' : ''}`}
            >
              <div className="col-span-6 flex items-center gap-3 min-w-0">
                <FileIcon category={category} size={18} />
                <span className="truncate font-medium" title={obj.name}>
                  {obj.name}
                </span>
              </div>

              <div className="col-span-2 text-sm text-muted-foreground">
                {obj.type === 'folder' ? '-' : formatFileSize(obj.size)}
              </div>

              <div className="col-span-3 text-sm text-muted-foreground">
                {formatDate(obj.lastModified)}
              </div>

              <div className="col-span-1 flex justify-end">
                {obj.type === 'folder' && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
