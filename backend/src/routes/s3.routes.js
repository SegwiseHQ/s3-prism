const express = require('express');
const router = express.Router();
const {
    listBuckets,
    listObjects,
    searchObjects,
    getObjectMetadata,
    getViewUrl,
    getObjectContent,
} = require('../controllers/s3.controller');

// Object routes
router.get('/buckets', listBuckets);
router.get('/buckets/:bucket/objects', listObjects);
router.get('/buckets/:bucket/search', searchObjects);
router.get('/buckets/:bucket/objects/:key(*)/metadata', getObjectMetadata);
router.get('/buckets/:bucket/objects/:key(*)/view', getViewUrl);

// Content route with OPTIONS support for CORS preflight
router.options('/buckets/:bucket/objects/:key(*)/content', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.status(204).end();
});
router.get('/buckets/:bucket/objects/:key(*)/content', getObjectContent);

module.exports = router;

