import { useState, useEffect, useMemo } from 'react';
import { S3Object } from '@/types/s3';
import { FileIcon } from './FileIcon';
import { getFileCategory, formatFileSize, formatDate, getFileExtension, getExtensionFromContentType } from '@/utils/fileUtils';
import { s3Api } from '@/lib/api';
import { CsvPreview } from './CsvPreview';
import { JsonViewer } from './JsonViewer';
import { TomlViewer } from './TomlViewer';
import { X, Copy, FileText, Eye, Info, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FilePreviewProps {
  object: S3Object;
  bucket: string;
  onClose: () => void;
}

type TabType = 'preview' | 'info';

export const FilePreview = ({ object, bucket, onClose }: FilePreviewProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | undefined>(object.contentType);

  const category = useMemo(() => getFileCategory(contentType, object.name), [contentType, object.name]);

  // Get extension from filename, or fallback to content-type if no extension
  const fileExtension = useMemo(() => getFileExtension(object.name).toLowerCase(), [object.name]);
  const extension = useMemo(() => fileExtension || getExtensionFromContentType(contentType), [fileExtension, contentType]);

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching metadata for:', bucket, object.key);

        // First, fetch metadata to get the actual Content-Type
        const metadata = await s3Api.getObjectMetadata(bucket, object.key);
        console.log('Metadata received:', metadata.metadata.contentType);
        setContentType(metadata.metadata.contentType);

        // For images, use the content URL directly
        const contentUrl = s3Api.getObjectContentUrl(bucket, object.key);
        console.log('Content URL:', contentUrl);
        setViewUrl(contentUrl);

        // Determine extension after we have the content type
        const actualFileExtension = getFileExtension(object.name).toLowerCase();
        const actualExtension = actualFileExtension || getExtensionFromContentType(metadata.metadata.contentType);
        console.log('Detected extension:', actualExtension, 'from contentType:', metadata.metadata.contentType);

        // For text-based files, fetch the content
        const textExtensions = ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'xml', 'csv', 'svg', 'yaml', 'yml', 'toml'];
        if (textExtensions.includes(actualExtension)) {
          const text = await s3Api.getObjectContent(bucket, object.key);
          setContent(text);
        }
      } catch (err) {
        console.error('Failed to fetch file content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileContent();
  }, [bucket, object.key]);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(`s3://${bucket}/${object.key}`);
    toast.success('Path copied to clipboard');
  };

  const handleCopyContent = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard');
    }
  };

  const handleDownload = async () => {
    try {
      const downloadUrl = s3Api.getObjectContentUrl(bucket, object.key);

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = object.name;
      link.target = '_blank';

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
    } catch (err) {
      console.error('Failed to download file:', err);
      toast.error('Failed to download file');
    }
  };

  const renderPreviewContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="flex items-center justify-center h-full bg-secondary/30 rounded-lg">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-sm text-destructive mb-1">Failed to load preview</p>
            <p className="text-xs text-muted-foreground/70">{error}</p>
          </div>
        </div>
      );
    }

    // Image preview - check both category and contentType
    const isImage = category === 'image' || contentType?.startsWith('image/');

    if (isImage) {
      // SVG with content
      if (extension === 'svg' && content) {
        return (
          <div className="flex flex-col h-full gap-4">
            <div className="bg-[#1a1a2e] rounded-lg p-6 flex items-center justify-center">
              <div
                className="max-w-full max-h-32 [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-h-32"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
            <div className="flex-1 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-mono">SVG Source</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleCopyContent}
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
              </div>
              <pre className="bg-[#0d1117] rounded-lg p-4 border border-border/50 text-xs font-mono overflow-x-auto">
                <code>{content}</code>
              </pre>
            </div>
          </div>
        );
      }

      // Other images with URL
      if (viewUrl) {
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 bg-[#0d1117] rounded-lg overflow-hidden flex items-center justify-center p-4">
              <img
                src={viewUrl}
                alt={object.name}
                crossOrigin="use-credentials"
                className="max-w-full max-h-full object-contain rounded"
                onLoad={() => {
                  console.log('Image loaded successfully:', viewUrl);
                }}
                onError={(e) => {
                  console.error('Image failed to load:', viewUrl);
                  console.error('Error details:', e);
                }}
              />
            </div>
            <div className="mt-3 text-center text-xs text-muted-foreground">
              {object.name} • {formatFileSize(object.size)}
            </div>
            <div className="mt-2 text-center text-[10px] text-muted-foreground/50 font-mono break-all px-4">
              {viewUrl}
            </div>
          </div>
        );
      }

      // Fallback for images without preview
      return (
        <div className="flex items-center justify-center h-full bg-secondary/30 rounded-lg">
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto rounded-xl bg-file-image/10 flex items-center justify-center mb-4">
              <FileIcon category="image" size={40} />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Image Preview</p>
            <p className="text-xs text-muted-foreground/70">
              {object.name} ({formatFileSize(object.size)})
            </p>
          </div>
        </div>
      );
    }

    // Video preview - check both category and contentType
    const isVideo = category === 'video' || contentType?.startsWith('video/');

    if (isVideo && viewUrl) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 bg-[#0d1117] rounded-lg overflow-hidden flex items-center justify-center p-4">
            <video
              src={viewUrl}
              controls
              crossOrigin="use-credentials"
              className="max-w-full max-h-full rounded"
              preload="metadata"
              onLoadStart={() => {
                console.log('Video load started:', viewUrl);
              }}
              onLoadedMetadata={(e) => {
                console.log('Video metadata loaded:', viewUrl);
                console.log('Duration:', e.currentTarget.duration);
                console.log('Video dimensions:', e.currentTarget.videoWidth, 'x', e.currentTarget.videoHeight);
              }}
              onLoadedData={() => {
                console.log('Video data loaded');
              }}
              onCanPlay={() => {
                console.log('Video can play');
              }}
              onError={(e) => {
                console.error('Video failed to load:', viewUrl);
                console.error('Error code:', e.currentTarget.error?.code);
                console.error('Error message:', e.currentTarget.error?.message);
                console.error('Network state:', e.currentTarget.networkState);
                console.error('Ready state:', e.currentTarget.readyState);
              }}
              onStalled={() => {
                console.warn('Video stalled');
              }}
              onSuspend={() => {
                console.warn('Video suspended');
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-3 text-center text-xs text-muted-foreground">
            {object.name} • {formatFileSize(object.size)}
          </div>
          <div className="mt-2 text-center text-[10px] text-muted-foreground/50 font-mono break-all px-4">
            URL: {viewUrl}
          </div>
          <div className="mt-1 text-center text-[10px] text-amber-400/70">
            Check browser console for detailed logs
          </div>
        </div>
      );
    }

    // CSV preview
    if (extension === 'csv' && content) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-mono">{object.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleCopyContent}
            >
              <Copy className="w-3 h-3" />
              Copy
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <CsvPreview content={content} />
          </div>
        </div>
      );
    }

    // No content available
    if (!content) {
      return (
        <div className="flex items-center justify-center h-full bg-secondary/30 rounded-lg">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto rounded-xl bg-muted flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Preview not available</p>
            <p className="text-xs text-muted-foreground/70">
              This file type cannot be previewed
            </p>
          </div>
        </div>
      );
    }

    // JSON content with pretty printing
    if (extension === 'json' && content) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-mono">{object.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleCopyContent}
            >
              <Copy className="w-3 h-3" />
              Copy
            </Button>
          </div>
          <div className="flex-1 overflow-auto bg-[#0d1117] rounded-lg p-4 border border-border/50">
            <JsonViewer content={content} />
          </div>
        </div>
      );
    }

    // TOML content with syntax highlighting
    if (extension === 'toml' && content) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-mono">{object.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleCopyContent}
            >
              <Copy className="w-3 h-3" />
              Copy
            </Button>
          </div>
          <div className="flex-1 overflow-auto bg-[#0d1117] rounded-lg p-4 border border-border/50">
            <TomlViewer content={content} />
          </div>
        </div>
      );
    }

    // Text/code content
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-mono">{object.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleCopyContent}
          >
            <Copy className="w-3 h-3" />
            Copy
          </Button>
        </div>
        <div className="flex-1 overflow-auto bg-[#0d1117] rounded-lg p-4 border border-border/50">
          <pre className="text-sm font-mono leading-relaxed">
            <code>{content}</code>
          </pre>
        </div>
      </div>
    );
  };

  const renderInfoContent = () => (
    <div className="space-y-6">
      {/* File Icon */}
      <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
          <FileIcon category={category} size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate" title={object.name}>{object.name}</div>
          <div className="text-sm text-muted-foreground">{contentType || 'Unknown type'}</div>
        </div>
      </div>

      {/* Details */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-foreground">Details</h4>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Size</dt>
            <dd className="font-mono text-foreground">{formatFileSize(object.size)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Modified</dt>
            <dd className="text-foreground">{formatDate(object.lastModified)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="text-xs text-foreground/80">{contentType || 'Unknown'}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-muted-foreground">Extension</dt>
            <dd className="font-mono text-foreground flex items-center gap-1">
              .{extension || 'none'}
              {!fileExtension && extension && (
                <span className="text-[10px] text-muted-foreground/60 italic">(from type)</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Bucket</dt>
            <dd className="font-mono text-foreground">{bucket}</dd>
          </div>
        </dl>
      </div>

      {/* Path */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-foreground">S3 URI</h4>
        <div
          className="p-3 bg-secondary/50 rounded-lg font-mono text-xs text-muted-foreground break-all cursor-pointer hover:bg-secondary transition-colors group"
          onClick={handleCopyPath}
        >
          <span className="group-hover:text-foreground transition-colors">s3://{bucket}/{object.key}</span>
        </div>
      </div>
    </div>
  );

  return (
    <aside className="w-full h-full bg-card border-l border-border flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5',
                activeTab === 'preview'
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5',
                activeTab === 'info'
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Info className="w-3.5 h-3.5" />
              Info
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-secondary rounded transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {activeTab === 'preview' ? renderPreviewContent() : renderInfoContent()}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="default"
          className="w-full justify-center gap-2"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
          Download File
        </Button>
        <Button
          variant="secondary"
          className="w-full justify-center gap-2"
          onClick={handleCopyPath}
        >
          <Copy className="w-4 h-4" />
          Copy S3 URI
        </Button>
      </div>
    </aside>
  );
};
