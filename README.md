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

## Deployment on AWS

### Frontend — S3 + CloudFront

1. Build the frontend:
   ```bash
   cd frontend
   VITE_API_BASE_URL=https://api.yourdomain.com npm run build
   ```

2. Create an S3 bucket for hosting:
   ```bash
   aws s3 mb s3://s3-prism-frontend
   aws s3 website s3://s3-prism-frontend --index-document index.html --error-document index.html
   ```

3. Upload the build output:
   ```bash
   aws s3 sync dist/ s3://s3-prism-frontend --delete
   ```

4. Create a CloudFront distribution pointing to the S3 bucket. Set the error page to return `/index.html` with status `200` so client-side routing works.

### Backend — EC2

1. Launch an EC2 instance (Amazon Linux 2023 or Ubuntu) and SSH in.

2. Install Node.js 18+:
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs    # Amazon Linux
   # or
   sudo apt install -y nodejs    # Ubuntu
   ```

3. Clone and set up:
   ```bash
   git clone https://github.com/SegwiseHQ/s3-prism.git
   cd s3-prism/backend
   npm install --production
   cp .env.example .env
   # Edit .env with production values:
   #   NODE_ENV=production
   #   CORS_ORIGIN=https://yourdomain.com
   #   FRONTEND_URL=https://yourdomain.com
   ```

4. Run with a process manager:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name s3-prism-backend
   pm2 save
   pm2 startup
   ```

5. Set up a reverse proxy (nginx) to terminate TLS and forward to port 3001.

### Backend — ECS/Fargate (Docker)

1. Build and push the Docker image:
   ```bash
   cd backend
   docker build -t s3-prism-backend .

   # Push to ECR
   aws ecr create-repository --repository-name s3-prism-backend
   aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
   docker tag s3-prism-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/s3-prism-backend:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/s3-prism-backend:latest
   ```

2. Create an ECS Fargate service using the pushed image. Pass environment variables via ECS task definition or AWS Secrets Manager.

3. Place an Application Load Balancer in front with an HTTPS listener.

### IAM Role (recommended over access keys)

Instead of using `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`, attach an IAM role to your EC2 instance or ECS task with the required S3 permissions:

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

When using an IAM role, remove `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from your `.env` — the AWS SDK will pick up credentials automatically.

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
