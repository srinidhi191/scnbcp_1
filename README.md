# SCNBCP - School Notice Board Communication Platform

A full-stack web application for managing school notices, queries, and communications. Built with React (frontend) and Node.js/Express (backend).

## ✨ Get Your Deploy Link Now!

**Want to deploy this project and get a public URL?** Choose your preferred platform:

### 🎯 [Quick Deployment Guide →](./DEPLOY.md)

## 🚀 One-Click Deploy

Deploy this application to the cloud with just a few clicks:

### Option 1: Deploy to Render (Recommended - Full Stack)

**Deploy both API and Frontend to Render:**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/srinidhi191/scnbcp_1)

This will create:
- `scnbcp-api` - Backend API service (Docker-based)
- `scnbcp-web` - Frontend static site

**After clicking the button:**
1. Sign in to Render (or create a free account)
2. Render will read the `render.yaml` file and set up both services
3. Configure the required environment variables (see below)
4. Click "Apply" to deploy

**Required Environment Variables (set in Render dashboard):**
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong secret key for JWT tokens
- `CLIENT_URL` - Your frontend URL (will be provided by Render)
- `VITE_API_URL` - Your backend API URL (for the frontend service)

### Option 2: Deploy Frontend to Netlify

**Deploy just the frontend to Netlify:**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/srinidhi191/scnbcp_1)

**After clicking:**
1. Sign in to Netlify
2. Netlify will read the `netlify.toml` configuration
3. Set the `VITE_API_URL` environment variable to your API URL
4. Deploy!

> **Note:** You'll still need to deploy the backend API separately (use Render Option 1 or deploy manually)

### Option 3: Deploy Frontend to Vercel

**Deploy the frontend to Vercel:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/srinidhi191/scnbcp_1&project-name=scnbcp-web&root-directory=apps/web&env=VITE_API_URL&envDescription=URL%20of%20your%20deployed%20backend%20API)

**Configuration:**
- Root Directory: `apps/web`
- Build Command: `npm ci && npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL` (your backend API URL)

## 📋 Project Structure

```
scnbcp_1/
├── apps/
│   ├── api/          # Backend API (Node.js + Express + TypeScript)
│   │   ├── src/      # Source code
│   │   ├── dist/     # Compiled code
│   │   ├── uploads/  # File uploads directory
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/          # Frontend (React + Vite + TypeScript)
│       ├── src/      # Source code
│       ├── dist/     # Build output
│       └── package.json
├── render.yaml       # Render deployment configuration
├── netlify.toml      # Netlify deployment configuration
├── vercel.json       # Vercel deployment configuration
└── README_DEPLOY.md  # Detailed deployment guide
```

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/srinidhi191/scnbcp_1.git
   cd scnbcp_1
   ```

2. **Set up the API:**
   ```bash
   cd apps/api
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   npm install
   npm run dev
   ```
   The API will run on `http://localhost:4000`

3. **Set up the Frontend:**
   ```bash
   cd apps/web
   cp .env.example .env
   # Edit .env to point to your API
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## 🔧 Environment Variables

### API (.env in apps/api/)

```bash
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-key
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
MAIL_FROM=noreply@yourdomain.com
```

### Frontend (.env in apps/web/)

```bash
VITE_API_URL=http://localhost:4000
VITE_OPEN_GMAIL_AFTER_LOGIN=false
```

## 📦 Building for Production

### Build API:
```bash
cd apps/api
npm run build
npm start
```

### Build Frontend:
```bash
cd apps/web
npm run build
npm run preview  # Preview production build
```

## 🔗 Deployment URLs

After deployment, your application will be available at:

**Render:**
- API: `https://scnbcp-api.onrender.com`
- Web: `https://scnbcp-web.onrender.com`

**Netlify:**
- Web: `https://[your-site-name].netlify.app`

**Vercel:**
- Web: `https://[your-site-name].vercel.app`

## 📚 Additional Documentation

- **[Quick Deployment Guide](./DEPLOY.md)** - ⚡ Fastest way to deploy and get your URLs
- [Detailed Deployment Guide](./README_DEPLOY.md) - Comprehensive deployment instructions with more options
- [Security Guide](./SECURITY.md) - Important security information and best practices
- [API Documentation](./apps/api/README.md) - API endpoints and usage (if available)

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Use strong, unique values for `JWT_SECRET` in production
- Configure CORS properly by setting `CLIENT_URL` to your frontend domain
- Use environment variables in your deployment platform for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Need Help?

- Check the [Detailed Deployment Guide](./README_DEPLOY.md)
- Review the [GitHub Actions workflow](./.github/workflows/deploy-render.yml) for CI/CD setup
- Open an issue if you encounter problems

---

Made with ❤️ for school communication management
