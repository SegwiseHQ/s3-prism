import { S3Bucket, S3Object } from '@/types/s3';

export const mockBuckets: S3Bucket[] = [
  { name: 'production-assets', region: 'us-east-1', createdAt: new Date('2024-01-15'), objectCount: 1234, size: 5.2 * 1024 * 1024 * 1024 },
  { name: 'user-uploads', region: 'us-west-2', createdAt: new Date('2024-02-20'), objectCount: 8567, size: 12.8 * 1024 * 1024 * 1024 },
  { name: 'backup-storage', region: 'eu-west-1', createdAt: new Date('2023-11-10'), objectCount: 456, size: 89.3 * 1024 * 1024 * 1024 },
  { name: 'logs-archive', region: 'ap-southeast-1', createdAt: new Date('2024-03-01'), objectCount: 23456, size: 2.1 * 1024 * 1024 * 1024 },
  { name: 'static-website', region: 'us-east-1', createdAt: new Date('2024-04-05'), objectCount: 89, size: 156 * 1024 * 1024 },
];

export const mockObjects: Record<string, S3Object[]> = {
  'production-assets': [
    { key: 'images/', name: 'images', type: 'folder' },
    { key: 'videos/', name: 'videos', type: 'folder' },
    { key: 'documents/', name: 'documents', type: 'folder' },
    { key: 'data/', name: 'data', type: 'folder' },
    { key: 'config.json', name: 'config.json', type: 'file', size: 2048, lastModified: new Date('2024-06-01'), contentType: 'application/json' },
    { key: 'README.md', name: 'README.md', type: 'file', size: 4096, lastModified: new Date('2024-05-28'), contentType: 'text/markdown' },
  ],
  'production-assets/images/': [
    { key: 'images/hero-banner.png', name: 'hero-banner.png', type: 'file', size: 2.5 * 1024 * 1024, lastModified: new Date('2024-06-10'), contentType: 'image/png' },
    { key: 'images/logo.svg', name: 'logo.svg', type: 'file', size: 12 * 1024, lastModified: new Date('2024-06-08'), contentType: 'image/svg+xml' },
    { key: 'images/team-photo.jpg', name: 'team-photo.jpg', type: 'file', size: 1.8 * 1024 * 1024, lastModified: new Date('2024-05-15'), contentType: 'image/jpeg' },
    { key: 'images/product-screenshot.png', name: 'product-screenshot.png', type: 'file', size: 890 * 1024, lastModified: new Date('2024-05-20'), contentType: 'image/png' },
    { key: 'images/icons/', name: 'icons', type: 'folder' },
  ],
  'production-assets/videos/': [
    { key: 'videos/intro.mp4', name: 'intro.mp4', type: 'file', size: 45 * 1024 * 1024, lastModified: new Date('2024-05-20'), contentType: 'video/mp4' },
    { key: 'videos/tutorial.webm', name: 'tutorial.webm', type: 'file', size: 120 * 1024 * 1024, lastModified: new Date('2024-04-10'), contentType: 'video/webm' },
  ],
  'production-assets/documents/': [
    { key: 'documents/annual-report.pdf', name: 'annual-report.pdf', type: 'file', size: 8.5 * 1024 * 1024, lastModified: new Date('2024-03-01'), contentType: 'application/pdf' },
    { key: 'documents/contracts/', name: 'contracts', type: 'folder' },
    { key: 'documents/presentation.pptx', name: 'presentation.pptx', type: 'file', size: 15 * 1024 * 1024, lastModified: new Date('2024-06-05'), contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  ],
  'production-assets/data/': [
    { key: 'data/users.csv', name: 'users.csv', type: 'file', size: 45 * 1024, lastModified: new Date('2024-06-01'), contentType: 'text/csv' },
    { key: 'data/sales-report.csv', name: 'sales-report.csv', type: 'file', size: 128 * 1024, lastModified: new Date('2024-05-28'), contentType: 'text/csv' },
    { key: 'data/analytics.json', name: 'analytics.json', type: 'file', size: 22 * 1024, lastModified: new Date('2024-06-10'), contentType: 'application/json' },
  ],
  'user-uploads': [
    { key: 'avatars/', name: 'avatars', type: 'folder' },
    { key: 'attachments/', name: 'attachments', type: 'folder' },
    { key: 'exports/', name: 'exports', type: 'folder' },
  ],
  'backup-storage': [
    { key: 'db-backups/', name: 'db-backups', type: 'folder' },
    { key: 'media-backups/', name: 'media-backups', type: 'folder' },
    { key: 'backup-2024-06-01.tar.gz', name: 'backup-2024-06-01.tar.gz', type: 'file', size: 25 * 1024 * 1024 * 1024, lastModified: new Date('2024-06-01'), contentType: 'application/gzip' },
  ],
  'logs-archive': [
    { key: '2024/', name: '2024', type: 'folder' },
    { key: '2023/', name: '2023', type: 'folder' },
  ],
  'static-website': [
    { key: 'index.html', name: 'index.html', type: 'file', size: 15 * 1024, lastModified: new Date('2024-06-12'), contentType: 'text/html' },
    { key: 'styles.css', name: 'styles.css', type: 'file', size: 8 * 1024, lastModified: new Date('2024-06-12'), contentType: 'text/css' },
    { key: 'app.js', name: 'app.js', type: 'file', size: 45 * 1024, lastModified: new Date('2024-06-12'), contentType: 'application/javascript' },
    { key: 'assets/', name: 'assets', type: 'folder' },
  ],
};

export const getObjectsForPath = (bucket: string, path: string = ''): S3Object[] => {
  const key = path ? `${bucket}/${path}` : bucket;
  return mockObjects[key] || [];
};

// Mock file contents for preview
export const mockFileContents: Record<string, string> = {
  'config.json': `{
  "apiVersion": "v2",
  "environment": "production",
  "features": {
    "darkMode": true,
    "analytics": true,
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "limits": {
    "maxUploadSize": 10485760,
    "maxConcurrentConnections": 100
  },
  "integrations": ["stripe", "sendgrid", "cloudflare"]
}`,
  'README.md': `# Production Assets

This bucket contains all production assets for the main application.

## Structure

- \`/images\` - Static images, logos, and banners
- \`/videos\` - Marketing and tutorial videos  
- \`/documents\` - PDFs, reports, and presentations
- \`/data\` - CSV exports and analytics data

## Usage

Assets are served via CloudFront CDN with the following base URL:
\`\`\`
https://cdn.example.com/assets/
\`\`\`

## Contact

For questions, reach out to the platform team at platform@example.com`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome | Example Site</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="hero">
    <nav class="navbar">
      <a href="/" class="logo">Example</a>
      <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
    <h1>Build something amazing</h1>
    <p>The modern platform for developers</p>
  </header>
  <main id="app"></main>
  <script src="app.js"></script>
</body>
</html>`,
  'styles.css': `/* Base styles */
:root {
  --primary: #0ea5e9;
  --primary-dark: #0284c7;
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
  --text-muted: #94a3b8;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--background);
  color: var(--text);
  line-height: 1.6;
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}`,
  'app.js': `// Main application entry point
const config = {
  apiEndpoint: '/api/v2',
  debug: false,
};

class App {
  constructor(options) {
    this.options = options;
    this.state = { user: null, isLoading: true };
  }

  async init() {
    try {
      console.log('Initializing...');
      await this.loadUser();
      this.render();
    } catch (error) {
      console.error('Failed:', error);
    }
  }

  async loadUser() {
    const response = await fetch(\`\${config.apiEndpoint}/user\`);
    if (response.ok) {
      this.state.user = await response.json();
    }
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = this.state.isLoading 
      ? '<div class="loader">Loading...</div>'
      : this.renderContent();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App(config);
  app.init();
});`,
  'images/logo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#grad)"/>
  <path d="M30 50 L45 65 L70 35" 
        stroke="white" 
        stroke-width="6" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
</svg>`,
  'data/users.csv': `id,name,email,role,department,joined,status
1,Sarah Chen,sarah.chen@example.com,Engineering Manager,Engineering,2022-03-15,active
2,Marcus Johnson,marcus.j@example.com,Senior Developer,Engineering,2021-08-22,active
3,Emily Rodriguez,emily.r@example.com,Product Designer,Design,2023-01-10,active
4,James Wilson,james.w@example.com,Data Analyst,Analytics,2022-11-05,active
5,Priya Patel,priya.p@example.com,Marketing Lead,Marketing,2021-05-18,active
6,David Kim,david.k@example.com,DevOps Engineer,Engineering,2023-06-01,active
7,Lisa Thompson,lisa.t@example.com,HR Manager,Human Resources,2020-09-12,active
8,Alex Rivera,alex.r@example.com,Frontend Developer,Engineering,2023-03-28,active
9,Nina Kowalski,nina.k@example.com,UX Researcher,Design,2022-07-14,on_leave
10,Ryan O'Brien,ryan.ob@example.com,Backend Developer,Engineering,2021-12-03,active`,
  'data/sales-report.csv': `month,revenue,orders,avg_order_value,new_customers,returning_customers
2024-01,125000,450,277.78,180,270
2024-02,142000,520,273.08,210,310
2024-03,168000,580,289.66,245,335
2024-04,155000,540,287.04,195,345
2024-05,189000,650,290.77,280,370
2024-06,210000,720,291.67,320,400`,
  'data/analytics.json': `{
  "period": "2024-Q2",
  "metrics": {
    "pageViews": 1250000,
    "uniqueVisitors": 485000,
    "avgSessionDuration": "4m 32s",
    "bounceRate": 0.42
  },
  "topPages": [
    { "path": "/", "views": 320000 },
    { "path": "/products", "views": 185000 },
    { "path": "/pricing", "views": 142000 }
  ]
}`,
};

// Mock image URLs for preview
export const mockImageUrls: Record<string, string> = {
  'images/hero-banner.png': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
  'images/team-photo.jpg': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
  'images/product-screenshot.png': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
};

export const getFileContent = (key: string): string | null => {
  // Try exact match first
  if (mockFileContents[key]) {
    return mockFileContents[key];
  }
  // Try just the filename
  const fileName = key.split('/').pop() || '';
  if (mockFileContents[fileName]) {
    return mockFileContents[fileName];
  }
  // Try with path
  for (const [mockKey, content] of Object.entries(mockFileContents)) {
    if (key.endsWith(mockKey) || mockKey.endsWith(key)) {
      return content;
    }
  }
  return null;
};

export const getImageUrl = (key: string): string | null => {
  if (mockImageUrls[key]) {
    return mockImageUrls[key];
  }
  for (const [mockKey, url] of Object.entries(mockImageUrls)) {
    if (key.endsWith(mockKey) || mockKey.endsWith(key)) {
      return url;
    }
  }
  return null;
};
