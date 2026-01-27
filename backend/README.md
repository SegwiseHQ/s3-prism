# S3 Prism Backend

The backend API service for [S3 Prism](https://github.com/SegwiseHQ/s3-prism) - a modern AWS S3 file browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![AWS SDK](https://img.shields.io/badge/AWS_SDK-v3-FF9900?logo=amazon-aws)

## Features

- **List Buckets** - View all accessible S3 buckets with optional filtering
- **Browse Objects** - Navigate bucket contents with folder hierarchy support
- **Search Files** - Search for files by name across buckets
- **File Preview** - Generate presigned URLs for secure file viewing
- **Content Streaming** - Proxy file content to avoid CORS issues
- **Metadata Access** - Retrieve detailed object metadata
- **Google OAuth** - Secure authentication with domain restriction support
- **Session Management** - Secure cookie-based sessions

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) 18+
- **Framework**: [Express.js](https://expressjs.com/) 4.x
- **AWS SDK**: [@aws-sdk/client-s3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/) v3
- **Authentication**: [Passport.js](https://www.passportjs.org/) with Google OAuth 2.0
- **Security**: [Helmet](https://helmetjs.github.io/), CORS, secure sessions

## Prerequisites

- Node.js 18+
- AWS Account with S3 access
- AWS credentials (Access Key ID and Secret Access Key)
- Google Cloud Console project with OAuth 2.0 credentials (for authentication)

## Quick Start

1. **Navigate to the backend directory**
   ```bash
   # From the repository root
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:3001/health
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `3001` |
| `NODE_ENV` | No | Environment mode | `development` |
| `AWS_REGION` | Yes | AWS region | - |
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key | - |
| `ALLOWED_BUCKETS` | No | Comma-separated bucket whitelist | All buckets |
| `CORS_ORIGIN` | Yes | Frontend URL for CORS | - |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret | - |
| `SESSION_SECRET` | Yes | Secret for session encryption | - |
| `ALLOWED_EMAIL_DOMAIN` | No | Restrict login to email domain | All domains |
| `FRONTEND_URL` | Yes | Frontend URL for OAuth redirects | - |

### AWS IAM Permissions

Your AWS credentials need these S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:GetObjectMetadata"
      ],
      "Resource": ["arn:aws:s3:::*"]
    }
  ]
}
```

For restricted access, replace `"arn:aws:s3:::*"` with specific bucket ARNs.

## API Reference

See [API.md](API.md) for complete API documentation.

### Quick Overview

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/auth/google` | Initiate Google OAuth |
| `GET /api/auth/status` | Check auth status |
| `GET /api/auth/logout` | Logout |
| `GET /api/s3/buckets` | List buckets |
| `GET /api/s3/buckets/:bucket/objects` | List objects |
| `GET /api/s3/buckets/:bucket/search` | Search objects |
| `GET /api/s3/buckets/:bucket/objects/:key/metadata` | Get metadata |
| `GET /api/s3/buckets/:bucket/objects/:key/view` | Get presigned URL |
| `GET /api/s3/buckets/:bucket/objects/:key/content` | Stream content |

All `/api/s3/*` endpoints require authentication.

## Project Structure

```
src/
├── index.js              # Express app setup and middleware
├── config/
│   └── aws.js            # AWS SDK configuration
├── controllers/
│   └── s3.controller.js  # S3 operations logic
├── middleware/
│   ├── authMiddleware.js # Route protection
│   └── errorHandler.js   # Global error handling
└── routes/
    ├── auth.routes.js    # OAuth routes
    └── s3.routes.js      # S3 API routes
```

## Docker

```dockerfile
# Build
docker build -t s3-prism-backend .

# Run
docker run -p 3001:3001 --env-file .env s3-prism-backend
```

## Related Projects

- [S3 Prism](../frontend/) - The React frontend for this backend

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Never commit `.env` files to version control
- Use IAM roles with minimal required permissions
- Enable HTTPS in production
- Consider using AWS STS for temporary credentials
- Restrict `ALLOWED_EMAIL_DOMAIN` to your organization

## License

MIT License - see the [LICENSE](../LICENSE) file for details
