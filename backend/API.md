# S3 Prism Backend - API Documentation

## Base URL
```
http://localhost:3001
```

## Endpoints

### 1. Health Check
Check if the server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T07:00:00.000Z",
  "service": "s3-prism-backend"
}
```

---

### 2. List All Buckets
Get a list of all accessible S3 buckets.

**Endpoint:** `GET /api/s3/buckets`

**Response:**
```json
{
  "buckets": [
    {
      "name": "my-bucket",
      "creationDate": "2025-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl http://localhost:3001/api/s3/buckets
```

---

### 3. List Objects in Bucket
List all objects (files and folders) in a specific bucket.

**Endpoint:** `GET /api/s3/buckets/:bucket/objects`

**Query Parameters:**
- `prefix` (optional) - Filter objects by prefix (folder path)
- `delimiter` (optional, default: `/`) - Delimiter for folder grouping
- `maxKeys` (optional, default: 1000) - Maximum number of objects to return
- `continuationToken` (optional) - Token for pagination

**Response:**
```json
{
  "bucket": "my-bucket",
  "prefix": "folder/",
  "objects": [
    {
      "key": "folder/file.txt",
      "size": 1024,
      "lastModified": "2025-12-25T07:00:00.000Z",
      "etag": "\"abc123\"",
      "storageClass": "STANDARD"
    }
  ],
  "folders": [
    {
      "prefix": "folder/subfolder/"
    }
  ],
  "isTruncated": false,
  "continuationToken": null,
  "keyCount": 1
}
```

**Examples:**
```bash
# List all objects in bucket
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects"

# List objects in a specific folder
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects?prefix=documents/"

# List with pagination
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects?maxKeys=100"
```

---

### 4. Search Objects
Search for objects in a bucket by keyword.

**Endpoint:** `GET /api/s3/buckets/:bucket/search`

**Query Parameters:**
- `query` (required) - Search term
- `prefix` (optional) - Limit search to specific prefix
- `maxResults` (optional, default: 100) - Maximum results to return

**Response:**
```json
{
  "bucket": "my-bucket",
  "query": "report",
  "results": [
    {
      "key": "reports/2025-report.pdf",
      "size": 2048,
      "lastModified": "2025-12-25T07:00:00.000Z",
      "etag": "\"def456\"",
      "storageClass": "STANDARD"
    }
  ],
  "count": 1,
  "hasMore": false
}
```

**Examples:**
```bash
# Search for files containing "report"
curl "http://localhost:3001/api/s3/buckets/my-bucket/search?query=report"

# Search within a specific folder
curl "http://localhost:3001/api/s3/buckets/my-bucket/search?query=invoice&prefix=documents/"

# Limit results
curl "http://localhost:3001/api/s3/buckets/my-bucket/search?query=image&maxResults=50"
```

---

### 5. Get Object Metadata
Get detailed metadata for a specific object.

**Endpoint:** `GET /api/s3/buckets/:bucket/objects/:key/metadata`

**Note:** The `:key` parameter can include slashes (e.g., `folder/subfolder/file.txt`)

**Response:**
```json
{
  "bucket": "my-bucket",
  "key": "folder/file.pdf",
  "metadata": {
    "contentType": "application/pdf",
    "contentLength": 1024000,
    "lastModified": "2025-12-25T07:00:00.000Z",
    "etag": "\"ghi789\"",
    "versionId": null,
    "storageClass": "STANDARD",
    "metadata": {}
  }
}
```

**Example:**
```bash
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects/documents/report.pdf/metadata"
```

---


### 6. Get View URL
Generate a presigned URL to view a file directly in the browser.

**Endpoint:** `GET /api/s3/buckets/:bucket/objects/:key/view`

**Query Parameters:**
- `expiresIn` (optional, default: 3600) - URL expiration time in seconds

**Response:**
```json
{
  "bucket": "my-bucket",
  "key": "images/photo.jpg",
  "url": "https://my-bucket.s3.amazonaws.com/images/photo.jpg?X-Amz-Algorithm=...",
  "expiresIn": 3600,
  "expiresAt": "2025-12-25T08:00:00.000Z",
  "contentType": "image/jpeg",
  "size": 512000
}
```

**Examples:**
```bash
# Get view URL with default expiration (1 hour)
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects/images/photo.jpg/view"

# Get view URL that expires in 10 minutes
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects/document.pdf/view?expiresIn=600"

# Get view URL that expires in 24 hours
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects/video.mp4/view?expiresIn=86400"
```

**Usage in Frontend:**
The returned URL can be used directly in the browser:
```javascript
// For images
<img src={url} alt="S3 Image" />

// For PDFs (in iframe)
<iframe src={url} />

// For videos
<video src={url} controls />

// Or open in new tab
window.open(url, '_blank');
```

---

### 7. Get Object Content (Proxy)
Stream object content directly through the backend. This endpoint proxies the S3 object to avoid CORS issues when accessing files directly from S3.

**Endpoint:** `GET /api/s3/buckets/:bucket/objects/:key/content`

**Note:** The `:key` parameter can include slashes (e.g., `folder/subfolder/file.txt`)

**Response:**
Returns the raw file content with appropriate Content-Type headers.

**Examples:**
```bash
# Get image content
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects/images/photo.jpg/content" > photo.jpg

# Get text file content
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects/data/config.json/content"

# Get document
curl "http://localhost:3001/api/s3/buckets/my-bucket/objects/documents/report.pdf/content" > report.pdf
```

**Usage in Frontend:**
This endpoint is CORS-enabled and can be used directly in your frontend:
```javascript
// For images
<img src="http://localhost:3001/api/s3/buckets/my-bucket/objects/images/photo.jpg/content" />

// For videos
<video src="http://localhost:3001/api/s3/buckets/my-bucket/objects/videos/demo.mp4/content" controls />

// Fetch text content
const response = await fetch('http://localhost:3001/api/s3/buckets/my-bucket/objects/data/file.json/content');
const content = await response.text();
```

---


## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "message": "Search query is required"
}
```

### 403 Forbidden
```json
{
  "error": "Access Denied",
  "message": "You do not have permission to access this bucket"
}
```

### 404 Not Found
```json
{
  "error": "Bucket Not Found",
  "message": "The specified bucket does not exist"
}
```

```json
{
  "error": "Object Not Found",
  "message": "The specified object does not exist"
}
```

### 500 Internal Server Error
```json
{
  "error": "Configuration Error",
  "message": "AWS credentials are not properly configured"
}
```

---

## CORS

The API supports CORS for the frontend origin specified in the `.env` file:
```
CORS_ORIGIN=http://localhost:5173
```

All endpoints include appropriate CORS headers to allow cross-origin requests from the frontend.

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting middleware for production use.

---

## Authentication

The backend uses AWS credentials from `~/.aws/credentials` or environment variables. No additional authentication is required for API endpoints, but you should implement authentication in production.
