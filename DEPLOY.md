# Quick Deployment Guide

This guide provides the fastest ways to get your SCNBCP application deployed and accessible via public URLs.

## 🚀 One-Click Deployment Options

### Option 1: Full Stack on Render (Recommended)

**Best for:** Deploying both frontend and backend together

**Steps:**
1. Click the button below:
   
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/srinidhi191/scnbcp_1)

2. Sign in to Render (free account)
3. Render will automatically:
   - Create `scnbcp-api` service (Backend)
   - Create `scnbcp-web` service (Frontend)
4. Set required environment variables in Render dashboard:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Strong secret for JWT tokens
   - `CLIENT_URL` - Your frontend URL (Render will provide this)
5. Click "Apply" - Your app will deploy in ~5 minutes

**Your URLs will be:**
- API: `https://scnbcp-api.onrender.com`
- Frontend: `https://scnbcp-web.onrender.com`

### Option 2: Frontend on Netlify

**Best for:** Quick frontend deployment (you'll need to deploy API separately)

**Steps:**
1. Click the button:
   
   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/srinidhi191/scnbcp_1)

2. Sign in to Netlify
3. Set environment variable:
   - `VITE_API_URL` - Your backend API URL
4. Deploy!

**Your URL:** `https://[your-site-name].netlify.app`

### Option 3: Frontend on Vercel

**Best for:** Vercel users or teams already using Vercel

**Steps:**
1. Click the button:
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/srinidhi191/scnbcp_1&project-name=scnbcp-web&root-directory=apps/web&env=VITE_API_URL&envDescription=URL%20of%20your%20deployed%20backend%20API)

2. Sign in to Vercel
3. Configure:
   - Root Directory: `apps/web`
   - Environment Variable: `VITE_API_URL` = Your backend API URL
4. Deploy!

**Your URL:** `https://[your-site-name].vercel.app`

## 📝 Required Environment Variables

### For API (Backend):
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-key-here
CLIENT_URL=https://your-frontend-url.com
```

Optional (for email notifications):
```bash
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
MAIL_FROM=noreply@yourdomain.com
```

### For Frontend (Web):
```bash
VITE_API_URL=https://your-api-url.com
```

## 🔐 Important Security Notes

⚠️ **Before deploying:**
1. Get a fresh MongoDB database (don't use development credentials)
2. Generate a strong JWT_SECRET:
   ```bash
   openssl rand -base64 32
   ```
3. Never commit `.env` files with real credentials
4. See [SECURITY.md](./SECURITY.md) for full security checklist

## 🎯 Quick Start Checklist

- [ ] Choose deployment platform (Render recommended for full-stack)
- [ ] Set up MongoDB database (MongoDB Atlas free tier works great)
- [ ] Generate secure JWT_SECRET
- [ ] Click deploy button
- [ ] Configure environment variables in platform dashboard
- [ ] Wait for deployment (~5 minutes)
- [ ] Visit your URLs and test!

## 🆘 Troubleshooting

**Build fails:**
- Check that all environment variables are set correctly
- Verify MongoDB connection string is correct
- Ensure MongoDB allows connections from your deployment platform IP

**Frontend can't connect to API:**
- Verify `VITE_API_URL` points to correct API URL
- Check API `CLIENT_URL` includes frontend URL for CORS
- Ensure API is deployed and running

**API won't start:**
- Check MongoDB connection
- Verify `JWT_SECRET` is set
- Check logs in deployment platform dashboard

## 📚 More Information

- [Full README with detailed instructions](./README.md)
- [Comprehensive deployment guide](./README_DEPLOY.md)
- [Security best practices](./SECURITY.md)

---

**Need help?** Open an issue on GitHub or check the detailed documentation.
