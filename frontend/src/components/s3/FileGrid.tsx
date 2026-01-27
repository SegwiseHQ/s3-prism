import { S3Object } from '@/types/s3';
import { FileIcon } from './FileIcon';
import { getFileCategory, formatFileSize, formatDate, getFileExtension } from '@/utils/fileUtils';
import { useEffect, useRef } from 'react';

interface FileGridProps {
  objects: S3Object[];
  onObjectClick: (obj: S3Object) => void;
  onObjectSelect: (obj: S3Object) => void;
  selectedObject: S3Object | null;
  focusedIndex: number;
}

export const FileGrid = ({ objects, onObjectClick, onObjectSelect, selectedObject, focusedIndex }: FileGridProps) => {
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

  const handleDoubleClick = (obj: S3Object) => {
    if (obj.type === 'folder') {
      onObjectClick(obj);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4 animate-fade-in">
      {objects.map((obj, index) => {
        const category = obj.type === 'folder' ? 'folder' : getFileCategory(obj.contentType, obj.name);
        const isSelected = selectedObject?.key === obj.key;
        const isFocused = focusedIndex === index;

        return (
          <div
            key={obj.key}
            ref={isFocused ? focusedRef : null}
            onClick={() => handleClick(obj)}
            onDoubleClick={() => handleDoubleClick(obj)}
            className={`file-grid-item group ${isSelected ? 'border-primary bg-primary/10' : ''} ${isFocused ? '!border-primary/30 !bg-secondary' : ''}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileIcon category={category} size={24} />
              </div>

              <div className="w-full">
                <div className="font-medium text-sm truncate mb-1" title={obj.name}>
                  {obj.name}
                </div>

                {obj.type === 'file' && (
                  <div className="text-xs text-muted-foreground">
                    {getFileExtension(obj.name)} · {formatFileSize(obj.size)}
                  </div>
                )}

                {obj.type === 'folder' && (
                  <div className="text-xs text-muted-foreground">Folder</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
