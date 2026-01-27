import { S3Bucket, S3Object } from "@/types/s3";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

interface BucketResponse {
  buckets: Array<{
    name: string;
    creationDate: string;
  }>;
  count: number;
}

interface ObjectsResponse {
  bucket: string;
  prefix: string;
  objects: Array<{
    key: string;
    size: number;
    lastModified: string;
    etag: string;
    storageClass: string;
  }>;
  folders: Array<{
    prefix: string;
  }>;
  isTruncated: boolean;
  continuationToken: string | null;
  keyCount: number;
}

interface SearchResponse {
  bucket: string;
  query: string;
  results: Array<{
    key: string;
    size: number;
    lastModified: string;
    etag: string;
    storageClass: string;
  }>;
  count: number;
  hasMore: boolean;
}

interface MetadataResponse {
  bucket: string;
  key: string;
  metadata: {
    contentType: string;
    contentLength: number;
    lastModified: string;
    etag: string;
    versionId: string | null;
    storageClass: string;
    metadata: Record<string, string>;
  };
}

interface ViewUrlResponse {
  bucket: string;
  key: string;
  url: string;
  expiresIn: number;
  expiresAt: string;
  contentType: string;
  size: number;
}

class S3ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: "include", // Ensure cookies are sent (important for CORS)
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(
        error.message || `API request failed: ${response.statusText}`
      );
    }

    return response.json();
  }

  async listBuckets(): Promise<S3Bucket[]> {
    const data = await this.fetchApi<BucketResponse>("/api/s3/buckets");

    return data.buckets.map((bucket) => ({
      name: bucket.name,
      region: "unknown", // Backend doesn't provide region in list
      createdAt: new Date(bucket.creationDate),
      objectCount: 0, // Not provided by backend
      size: 0, // Not provided by backend
    }));
  }

  async listObjects(bucket: string, prefix: string = ""): Promise<S3Object[]> {
    const queryParams = new URLSearchParams();
    if (prefix) {
      queryParams.append("prefix", prefix);
    }

    const endpoint = `/api/s3/buckets/${encodeURIComponent(bucket)}/objects${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const data = await this.fetchApi<ObjectsResponse>(endpoint);

    const objects: S3Object[] = [];

    // Add folders
    data.folders.forEach((folder) => {
      const folderName =
        folder.prefix.split("/").filter(Boolean).pop() || folder.prefix;
      objects.push({
        key: folder.prefix,
        name: folderName,
        type: "folder",
      });
    });

    // Add files
    data.objects.forEach((obj) => {
      const fileName = obj.key.split("/").pop() || obj.key;
      objects.push({
        key: obj.key,
        name: fileName,
        type: "file",
        size: obj.size,
        lastModified: new Date(obj.lastModified),
        etag: obj.etag,
      });
    });

    return objects;
  }

  async searchObjects(
    bucket: string,
    query: string,
    prefix?: string
  ): Promise<S3Object[]> {
    const queryParams = new URLSearchParams({ query });
    if (prefix) {
      queryParams.append("prefix", prefix);
    }

    const endpoint = `/api/s3/buckets/${encodeURIComponent(
      bucket
    )}/search?${queryParams.toString()}`;
    const data = await this.fetchApi<SearchResponse>(endpoint);

    return data.results.map((obj) => {
      const fileName = obj.key.split("/").pop() || obj.key;
      return {
        key: obj.key,
        name: fileName,
        type: "file" as const,
        size: obj.size,
        lastModified: new Date(obj.lastModified),
        etag: obj.etag,
      };
    });
  }

  async getObjectMetadata(
    bucket: string,
    key: string
  ): Promise<MetadataResponse> {
    const endpoint = `/api/s3/buckets/${encodeURIComponent(
      bucket
    )}/objects/${encodeURIComponent(key)}/metadata`;
    return this.fetchApi<MetadataResponse>(endpoint);
  }

  async getViewUrl(
    bucket: string,
    key: string,
    expiresIn: number = 3600
  ): Promise<ViewUrlResponse> {
    const queryParams = new URLSearchParams({
      expiresIn: expiresIn.toString(),
    });
    const endpoint = `/api/s3/buckets/${encodeURIComponent(
      bucket
    )}/objects/${encodeURIComponent(key)}/view?${queryParams.toString()}`;

    return this.fetchApi<ViewUrlResponse>(endpoint);
  }

  async getObjectContent(bucket: string, key: string): Promise<string> {
    const endpoint = `/api/s3/buckets/${encodeURIComponent(
      bucket
    )}/objects/${encodeURIComponent(key)}/content`;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(
        error.message ||
          `Failed to fetch object content: ${response.statusText}`
      );
    }

    return response.text();
  }

  getObjectContentUrl(bucket: string, key: string): string {
    return `${this.baseUrl}/api/s3/buckets/${encodeURIComponent(
      bucket
    )}/objects/${encodeURIComponent(key)}/content`;
  }

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> {
    return this.fetchApi("/health");
  }
}

export const s3Api = new S3ApiClient();
