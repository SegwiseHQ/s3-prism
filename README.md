# S3 Prism

A modern, secure AWS S3 file browser with a React frontend and Node.js backend. Browse buckets, preview files, and search across your S3 storage with a clean, responsive interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)

## Features

- **Bucket Explorer** - Sidebar navigation for all accessible S3 buckets
- **File Navigation** - Browse folders with breadcrumb navigation and multiple view modes (grid/list)
- **File Preview** - In-browser preview for images, PDFs, videos, audio, code, JSON, TOML, and CSV files
- **Search** - Full-text search across all objects in your buckets
- **Google OAuth** - Secure authentication with optional email domain restriction
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/SegwiseHQ/s3-prism.git
   cd s3-prism
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   pnpm install
   ```

3. Configure backend environment:
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and Google OAuth settings
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

5. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

6. Start the frontend development server:
   ```bash
   npm run dev
   ```

7. Open http://localhost:3000 in your browser

## Configuration

### Backend Environment Variables

Configure these variables in `backend/.env`:

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_REGION` | AWS region for S3 access | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key ID | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `SESSION_SECRET` | Secret key for session encryption | Yes |
| `CORS_ORIGIN` | Frontend URL (default: http://localhost:8080) | Yes |
| `FRONTEND_URL` | Frontend URL for OAuth redirects | Yes |
| `ALLOWED_EMAIL_DOMAIN` | Restrict access to specific email domain (e.g., company.com) | No |
| `ALLOWED_BUCKETS` | Comma-separated list of bucket names to restrict access | No |

### Frontend Environment Variables

Configure these variables in `frontend/.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | http://localhost:3001 |

## Docker

Build and run the backend using Docker:

```bash
cd backend
docker build -t s3-prism-backend .
docker run -p 3001:3001 --env-file .env s3-prism-backend
```

## API Documentation

For detailed API endpoint documentation, see [backend/API.md](backend/API.md).

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests where applicable.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
