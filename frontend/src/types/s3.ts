export interface S3Bucket {
  name: string;
  region: string;
  createdAt: Date;
  objectCount: number;
  size: number;
}

export interface S3Object {
  key: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: Date;
  contentType?: string;
  etag?: string;
}

export type FileCategory = 'image' | 'document' | 'code' | 'archive' | 'video' | 'audio' | 'folder' | 'other';

export type ViewMode = 'grid' | 'list';

export interface BreadcrumbItem {
  label: string;
  path: string;
}
