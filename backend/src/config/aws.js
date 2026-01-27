const { S3Client } = require('@aws-sdk/client-s3');

// Initialize S3 client
// The SDK will automatically use credentials from ~/.aws/credentials
// You can override with environment variables if needed
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    // Credentials are loaded automatically from:
    // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    // 2. ~/.aws/credentials file
    // 3. IAM role (if running on EC2)
    ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    }),
});

// Get allowed buckets from environment or return null for all buckets
const getAllowedBuckets = () => {
    const buckets = process.env.ALLOWED_BUCKETS;
    return buckets ? buckets.split(',').map(b => b.trim()) : null;
};

module.exports = {
    s3Client,
    getAllowedBuckets,
};
