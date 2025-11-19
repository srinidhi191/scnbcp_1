# Security Policy

## 🔒 Security Best Practices

### Environment Variables

**IMPORTANT:** Environment files (`.env`) containing sensitive credentials were previously committed to this repository. If you cloned this repository:

1. **Rotate all secrets immediately:**
   - Change your MongoDB password
   - Generate a new `JWT_SECRET`
   - Update SMTP credentials
   - Any other sensitive information in the `.env` files

2. **Never commit `.env` files:**
   - Use `.env.example` files as templates (these are safe to commit)
   - The `.gitignore` file now excludes `.env` files
   - Copy `.env.example` to `.env` and fill in your values locally

### Credentials That Need to Be Rotated

If you used credentials from the committed `.env` files, rotate these immediately:

- **MongoDB Connection String** (`MONGO_URI`)
- **JWT Secret** (`JWT_SECRET`)
- **SMTP Credentials** (`SMTP_USER`, `SMTP_PASS`)

### For New Deployments

When deploying to production:

1. Use your hosting platform's environment variable management (Render, Netlify, Vercel dashboards)
2. Generate strong, unique secrets for production
3. Never reuse development credentials in production
4. Use MongoDB IP whitelist or VPC for database access
5. Enable MongoDB authentication and use strong passwords

### Generating Secure Secrets

Generate a secure JWT secret:
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Reporting Security Issues

If you discover a security vulnerability, please email the repository owner directly. Do not create a public issue.

## Security Updates

- ✅ Added `.gitignore` to prevent future `.env` commits
- ✅ Created `.env.example` templates
- ✅ Removed `.env` files from git tracking
- ⚠️ Historical `.env` files still exist in git history - rotate all secrets

## Secure Deployment Checklist

Before deploying to production:

- [ ] Rotate all secrets from development
- [ ] Use strong, unique JWT_SECRET
- [ ] Configure MongoDB with authentication and IP whitelist
- [ ] Use secure SMTP service (not test/development services)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS with specific origins (not `*`)
- [ ] Enable HTTPS for all services
- [ ] Review and limit file upload sizes
- [ ] Set up monitoring and logging
- [ ] Regular security updates for dependencies

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
