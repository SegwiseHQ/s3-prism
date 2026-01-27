import { FileCategory } from '@/types/s3';

export const getFileCategory = (contentType?: string, fileName?: string): FileCategory => {
  if (!contentType && !fileName) return 'other';

  const type = contentType?.toLowerCase() || '';
  const name = fileName?.toLowerCase() || '';

  // Images
  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|svg|webp|ico|bmp)$/.test(name)) {
    return 'image';
  }

  // Videos
  if (type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/.test(name)) {
    return 'video';
  }

  // Audio
  if (type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac)$/.test(name)) {
    return 'audio';
  }

  // Archives
  if (/\.(zip|tar|gz|rar|7z|bz2)$/.test(name) || type.includes('zip') || type.includes('tar') || type.includes('gzip')) {
    return 'archive';
  }

  // Code
  if (/\.(js|ts|tsx|jsx|py|rb|go|rs|java|cpp|c|h|css|scss|html|xml|json|yaml|yml|toml|md|sh|bash)$/.test(name)) {
    return 'code';
  }

  // Documents
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)$/.test(name) ||
    type.includes('pdf') || type.includes('document') || type.includes('spreadsheet')) {
    return 'document';
  }

  return 'other';
};

export const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return '-';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
};

export const formatDate = (date?: Date): string => {
  if (!date) return '-';

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
};

/**
 * Get file extension from Content-Type MIME type
 * Useful for files without extensions
 */
export const getExtensionFromContentType = (contentType?: string): string => {
  if (!contentType) return '';

  const type = contentType.toLowerCase().split(';')[0].trim();

  // Common MIME type to extension mappings
  const mimeToExt: Record<string, string> = {
    // Text
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'text/csv': 'csv',
    'text/xml': 'xml',
    'text/markdown': 'md',
    'application/toml': 'toml',

    // Application
    'application/json': 'json',
    'application/xml': 'xml',
    'application/javascript': 'js',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/x-tar': 'tar',
    'application/gzip': 'gz',

    // Images
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/x-icon': 'ico',

    // Video
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',

    // Audio
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',

    // Documents
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  };

  return mimeToExt[type] || '';
};
