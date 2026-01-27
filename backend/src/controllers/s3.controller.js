const {
    ListBucketsCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
    GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, getAllowedBuckets } = require('../config/aws');

/**
 * List all S3 buckets (filtered by allowed buckets if configured)
 */
const listBuckets = async (req, res) => {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    let buckets = response.Buckets || [];
    const allowedBuckets = getAllowedBuckets();

    // Filter buckets if ALLOWED_BUCKETS is configured
    if (allowedBuckets) {
        buckets = buckets.filter(bucket => allowedBuckets.includes(bucket.Name));
    }

    res.json({
        buckets: buckets.map(bucket => ({
            name: bucket.Name,
            creationDate: bucket.CreationDate,
        })),
        count: buckets.length,
    });
};

/**
 * List objects in a specific bucket with optional prefix and pagination
 */
const listObjects = async (req, res) => {
    const { bucket } = req.params;
    const { prefix = '', delimiter = '/', maxKeys = 1000, continuationToken } = req.query;

    // Check if bucket is allowed
    const allowedBuckets = getAllowedBuckets();
    if (allowedBuckets && !allowedBuckets.includes(bucket)) {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'You do not have permission to access this bucket',
        });
    }

    const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        Delimiter: delimiter,
        MaxKeys: parseInt(maxKeys),
        ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    res.json({
        bucket,
        prefix,
        objects: (response.Contents || []).map(obj => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
            etag: obj.ETag,
            storageClass: obj.StorageClass,
        })),
        folders: (response.CommonPrefixes || []).map(prefix => ({
            prefix: prefix.Prefix,
        })),
        isTruncated: response.IsTruncated,
        continuationToken: response.NextContinuationToken,
        keyCount: response.KeyCount,
    });
};

/**
 * Search for objects in a bucket by keyword
 */
const searchObjects = async (req, res) => {
    const { bucket } = req.params;
    const { query, prefix = '', maxResults = 100 } = req.query;

    if (!query) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Search query is required',
        });
    }

    // Check if bucket is allowed
    const allowedBuckets = getAllowedBuckets();
    if (allowedBuckets && !allowedBuckets.includes(bucket)) {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'You do not have permission to access this bucket',
        });
    }

    const searchTerm = query.toLowerCase();
    const results = [];
    let continuationToken;

    // Search through objects (paginated)
    do {
        const command = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: continuationToken,
            MaxKeys: 1000,
        });

        const response = await s3Client.send(command);
        const contents = response.Contents || [];

        // Filter objects that match the search query
        const matches = contents.filter(obj =>
            obj.Key.toLowerCase().includes(searchTerm)
        );

        results.push(...matches);
        continuationToken = response.NextContinuationToken;

        // Stop if we have enough results
        if (results.length >= maxResults) {
            break;
        }
    } while (continuationToken);

    res.json({
        bucket,
        query,
        results: results.slice(0, maxResults).map(obj => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
            etag: obj.ETag,
            storageClass: obj.StorageClass,
        })),
        count: Math.min(results.length, maxResults),
        hasMore: results.length > maxResults,
    });
};

/**
 * Get metadata for a specific object
 */
const getObjectMetadata = async (req, res) => {
    const { bucket, key } = req.params;

    // Check if bucket is allowed
    const allowedBuckets = getAllowedBuckets();
    if (allowedBuckets && !allowedBuckets.includes(bucket)) {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'You do not have permission to access this bucket',
        });
    }

    const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    try {
        const response = await s3Client.send(command);

        res.json({
            bucket,
            key,
            metadata: {
                contentType: response.ContentType,
                contentLength: response.ContentLength,
                lastModified: response.LastModified,
                etag: response.ETag,
                versionId: response.VersionId,
                storageClass: response.StorageClass,
                metadata: response.Metadata,
            },
        });
    } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Object not found',
            });
        }
        console.error('Error getting object metadata:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get object metadata',
        });
    }
};

/**
 * Generate a presigned URL for viewing an object in the browser
 */
const getViewUrl = async (req, res) => {
    const { bucket, key } = req.params;
    const { expiresIn = 3600 } = req.query; // Default 1 hour

    // Check if bucket is allowed
    const allowedBuckets = getAllowedBuckets();
    if (allowedBuckets && !allowedBuckets.includes(bucket)) {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'You do not have permission to access this bucket',
        });
    }

    let metadata;
    try {
        // Get object metadata to determine content type
        const headCommand = new HeadObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        metadata = await s3Client.send(headCommand);
    } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Object not found',
            });
        }
        console.error('Error getting object metadata:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get object metadata',
        });
    }

    // Create GetObject command with ResponseContentDisposition for inline viewing
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: 'inline', // View in browser instead of download
    });

    // Generate presigned URL
    const url = await getSignedUrl(s3Client, command, {
        expiresIn: parseInt(expiresIn),
    });

    res.json({
        bucket,
        key,
        url,
        expiresIn: parseInt(expiresIn),
        expiresAt: new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString(),
        contentType: metadata.ContentType,
        size: metadata.ContentLength,
    });
};

/**
 * Stream object content directly (proxy to avoid CORS issues)
 */
const getObjectContent = async (req, res) => {
    const { bucket, key } = req.params;

    // Check if bucket is allowed
    const allowedBuckets = getAllowedBuckets();
    if (allowedBuckets && !allowedBuckets.includes(bucket)) {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'You do not have permission to access this bucket',
        });
    }

    try {
        // First, get object metadata to know the size
        const headCommand = new HeadObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        const metadata = await s3Client.send(headCommand);
        const fileSize = metadata.ContentLength;
        const contentType = metadata.ContentType || 'application/octet-stream';

        // Parse range header if present (for video seeking)
        const range = req.headers.range;

        if (range) {
            // Parse range header (e.g., "bytes=0-1023")
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;

            // Get partial content from S3
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
                Range: `bytes=${start}-${end}`,
            });

            const response = await s3Client.send(command);

            // Set partial content headers
            res.status(206); // Partial Content
            res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Length', chunkSize);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');

            // Explicit CORS headers for video/media streaming
            res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:8080');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');

            // Stream the partial response
            response.Body.pipe(res);
        } else {
            // No range request, send full file
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const response = await s3Client.send(command);

            // Set appropriate headers
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', fileSize);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'public, max-age=3600');

            // Explicit CORS headers for video/media streaming
            res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:8080');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');

            // Stream the response body
            response.Body.pipe(res);
        }
    } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Object not found',
            });
        }
        console.error('Error streaming object:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to stream object content',
        });
    }
};

module.exports = {
    listBuckets,
    listObjects,
    searchObjects,
    getObjectMetadata,
    getViewUrl,
    getObjectContent,
};
