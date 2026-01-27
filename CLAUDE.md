# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

S3 Prism is a modern AWS S3 file browser with a React frontend and Node.js/Express backend. The project uses a monorepo-like structure with two separate applications.

## Repository Structure

```
s3-viewer/
├── frontend/          # React frontend (Vite + TypeScript + shadcn/ui)
└── backend/           # Express.js backend (CommonJS)
```

## Development Commands

### Frontend (frontend/)
```bash
cd frontend
npm install        # Install dependencies (uses bun.lockb)
npm run dev        # Start dev server on port 3000
npm run build      # Production build
npm run lint       # Run ESLint
```

### Backend (backend/)
```bash
cd backend
pnpm install       # Install dependencies (uses pnpm)
npm run dev        # Start with nodemon on port 3001
npm start          # Production start
```

### Running Both
Start backend first (port 3001), then frontend (port 3000). The frontend proxies `/api` and `/health` requests to the backend via Vite config.

## Architecture

### Frontend Architecture
- **React 19** with TypeScript and Vite 7
- **Tailwind CSS 4** with shadcn/ui components
- **React Query** for server state management
- **React Router** for navigation

Key directories:
- `src/components/s3/` - S3-specific components (FileBrowser, FilePreview, BucketSidebar)
- `src/components/ui/` - shadcn/ui component library
- `src/lib/api.ts` - S3ApiClient class wrapping all backend API calls
- `src/types/s3.ts` - TypeScript interfaces for S3 objects
- `src/contexts/AuthContext.tsx` - Google OAuth authentication context

The frontend uses `@/` path alias resolving to `src/`.

### Backend Architecture
- **Express.js** with CommonJS modules
- **AWS SDK v3** for S3 operations
- **Passport.js** with Google OAuth 2.0
- **express-session** for session management

Key files:
- `src/index.js` - Express app setup, middleware, route mounting
- `src/routes/s3.routes.js` - S3 API route definitions
- `src/routes/auth.routes.js` - OAuth routes
- `src/controllers/s3.controller.js` - S3 operations logic
- `src/config/aws.js` - AWS SDK configuration
- `src/middleware/authMiddleware.js` - Route protection

### API Endpoints
All S3 endpoints require authentication (`/api/s3/*`):
- `GET /api/s3/buckets` - List accessible buckets
- `GET /api/s3/buckets/:bucket/objects` - List objects with prefix/pagination
- `GET /api/s3/buckets/:bucket/search` - Search objects by keyword
- `GET /api/s3/buckets/:bucket/objects/:key/metadata` - Get object metadata
- `GET /api/s3/buckets/:bucket/objects/:key/view` - Get presigned URL
- `GET /api/s3/buckets/:bucket/objects/:key/content` - Stream object content

See `backend/API.md` for detailed API documentation.

## Configuration

### Backend Environment (.env)
Required variables in `backend/.env`:
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:8080)
- `FRONTEND_URL` - For OAuth redirects
- `ALLOWED_EMAIL_DOMAIN` - Restrict to specific domain (e.g., yourdomain.com)

Optional: `ALLOWED_BUCKETS` - Comma-separated list to restrict bucket access

### Frontend Environment
- `VITE_API_BASE_URL` - Backend URL (default: http://localhost:3001)

## Key Patterns

### S3 API Client (Frontend)
All S3 API calls go through `s3Api` singleton in `src/lib/api.ts`. The client handles:
- Request/response typing
- Error handling
- Credential passing via cookies

### Authentication Flow
1. User clicks login -> redirected to Google OAuth
2. Backend validates email domain and creates session
3. Session cookie sent with all subsequent requests
4. `requireAuth` middleware protects S3 routes
