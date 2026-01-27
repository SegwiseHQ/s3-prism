# S3 Prism

A modern, fast, and intuitive web-based file browser for Amazon S3. Navigate your S3 buckets with a beautiful interface, preview files directly in the browser, and manage your cloud storage effortlessly.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)

## Features

- **Bucket Explorer** - Browse all your accessible S3 buckets from a clean sidebar
- **File Navigation** - Navigate through folders with breadcrumb navigation and keyboard shortcuts
- **File Preview** - Preview images, PDFs, videos, audio, code, JSON, TOML, and CSV files directly in the browser
- **Search** - Quickly find files across your bucket with real-time search
- **Multiple Views** - Switch between grid and list views based on your preference
- **Secure Authentication** - Google OAuth integration with domain restriction support
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query) (React Query)
- **Routing**: [React Router 7](https://reactrouter.com/)

## Prerequisites

- Node.js 18+
- [S3 Prism Backend](../backend/) running

## Quick Start

1. **Navigate to the frontend directory**
   ```bash
   # From the repository root
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment** (optional)
   ```bash
   # Create .env file if you need to override defaults
   echo "VITE_API_BASE_URL=http://localhost:3001" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:dev` | Build with development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3001` |

### Vite Proxy

The development server proxies `/api` and `/health` requests to the backend. Configure the target in `vite.config.ts` if needed.

## Project Structure

```
src/
├── components/
│   ├── s3/           # S3-specific components (FileBrowser, FilePreview, etc.)
│   └── ui/           # shadcn/ui component library
├── contexts/         # React contexts (AuthContext)
├── hooks/            # Custom React hooks
├── lib/              # Utilities and API client
├── pages/            # Route pages
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

## Related Projects

- [S3 Prism Backend](../backend/) - The Express.js backend API that powers this frontend

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide](https://lucide.dev/)
