import { Database } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-fade-in">
      <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        <Database className="w-12 h-12 text-primary/50" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Select a Bucket</h2>
      <p className="text-sm max-w-md text-center">
        Choose a bucket from the sidebar to browse and view your S3 objects and file contents.
      </p>
    </div>
  );
};
