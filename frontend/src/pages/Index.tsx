import { useState, useEffect } from 'react';
import { BucketSidebar } from '@/components/s3/BucketSidebar';
import { FileBrowser } from '@/components/s3/FileBrowser';
import { EmptyState } from '@/components/s3/EmptyState';
import { CommandPalette } from '@/components/CommandPalette';
import { s3Api } from '@/lib/api';
import { S3Bucket } from '@/types/s3';
import { Loader2, AlertCircle } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const Index = () => {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<S3Bucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedBuckets = await s3Api.listBuckets();
        setBuckets(fetchedBuckets);
      } catch (err) {
        console.error('Failed to fetch buckets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load buckets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuckets();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading buckets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Failed to Connect</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            Make sure the backend is running on port 3001
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <CommandPalette
        buckets={buckets}
        selectedBucket={selectedBucket}
        onSelectBucket={setSelectedBucket}
      />
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={20} minSize={5}>
          <BucketSidebar
            buckets={buckets}
            selectedBucket={selectedBucket}
            onSelectBucket={setSelectedBucket}
            onClearSelection={() => setSelectedBucket(null)}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={80} minSize={5}>
          {selectedBucket ? (
            <FileBrowser bucket={selectedBucket} onGoHome={() => setSelectedBucket(null)} />
          ) : (
            <EmptyState />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
