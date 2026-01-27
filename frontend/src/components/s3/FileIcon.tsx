import {
  Folder,
  Image,
  FileText,
  FileCode,
  Archive,
  Video,
  Music,
  File
} from 'lucide-react';
import { FileCategory } from '@/types/s3';
import { cn } from '@/lib/utils';

interface FileIconProps {
  category: FileCategory;
  className?: string;
  size?: number;
}

const iconMap: Record<FileCategory, typeof File> = {
  folder: Folder,
  image: Image,
  document: FileText,
  code: FileCode,
  archive: Archive,
  video: Video,
  audio: Music,
  other: File,
};

const colorMap: Record<FileCategory, string> = {
  folder: 'text-file-folder',
  image: 'text-file-image',
  document: 'text-file-document',
  code: 'text-file-code',
  archive: 'text-file-archive',
  video: 'text-file-video',
  audio: 'text-file-audio',
  other: 'text-muted-foreground',
};

export const FileIcon = ({ category, className, size = 20 }: FileIconProps) => {
  // Use HalfColoredFolder for folder category
  if (category === 'folder') {
    return <HalfColoredFolder size={size} className={className} />;
  }

  const Icon = iconMap[category];

  return (
    <Icon
      size={size}
      className={cn(colorMap[category], className)}
    />
  );
};

export function HalfColoredFolder({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        {/* Folder silhouette path (simplified but matches Lucide) */}
        <clipPath id="folderClip">
          <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
        </clipPath>
      </defs>

      {/* Bottom-half fill */}
      <rect
        x="0"
        y="12"
        width="24"
        height="12"
        fill="#f97316"
        clipPath="url(#folderClip)"
      />

      {/* Outline */}
      <Folder stroke="#374151" strokeWidth={2} fill="none" />
    </svg>
  );
}
