# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment Verification

### Code Quality
- [ ] All tests pass: `npm test` (both client & server)
- [ ] No console errors in browser dev tools
- [ ] No linting warnings: `npm run lint`
- [ ] Code coverage acceptable (80%+)
- [ ] Git log is clean: `git log --oneline -10`

### Security
- [ ] `.env` file NOT committed
- [ ] `.env.example` contains only placeholders
- [ ] No API keys in source code
- [ ] No secrets in git history: `git log -p | grep -i "APIza\|key\|secret"`
- [ ] Helmet configured in server.js
- [ ] CORS whitelist configured
- [ ] Rate limiting enabled

### Dependencies
- [ ] No critical npm vulnerabilities: `npm audit --audit-level=moderate`
- [ ] All dependencies up-to-date
- [ ] Lock files committed: `package-lock.json`
- [ ] Node version specified in `engines` field

### Documentation
- [ ] README.md updated with new features
- [ ] API endpoints documented
- [ ] Environment variables listed in .env.example
- [ ] Troubleshooting guide updated
- [ ] CONTRIBUTING.md exists
- [ ] SECURITY.md exists

## Deployment Process

### Option 1: Local (Development)

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Create .env from template
cd server && cp .env.example .env
# Edit .env with your keys

# 3. Start backend
npm run dev
# Should see: "Server running on port 5000"

# 4. Start frontend (new terminal)
cd client && npm run dev
# Should see: "Local: http://localhost:5173"

# 5. Verify features
# - [ ] Open http://localhost:5173
# - [ ] Search for stock, see details load
# - [ ] Check console for no errors
# - [ ] Add stock to watchlist
# - [ ] Compare stocks
```

### Option 2: Vercel (Serverless, Recommended)

```bash
# 1. Verify all changes committed
git status
# Should show: "nothing to commit, working tree clean"

# 2. Push to GitHub
git push origin main

# 3. Connect to Vercel
# Visit: https://vercel.com
# Import project from GitHub
# Set environment variables:
#   MONGO_URI = ...
#   GEMINI_API_KEY = ...
#   ALPHA_VANTAGE_API_KEY = ...
#   NEWSAPI_KEY = ...
#   CORS_ORIGINS = https://yourproject.vercel.app

# 4. Deploy
# Vercel auto-deploys on push

# 5. Verify deployment
# Visit: https://yourproject.vercel.app
# Check: /api/stocks/market/overview returns data
```

### Option 3: AWS (Enterprise)

```bash
# 1. Prerequisites
[ ] AWS account created
[ ] AWS CLI configured: aws configure
[ ] Terraform installed: terraform -v
[ ] All env vars ready

# 2. Initialize infrastructure
cd aws/terraform
terraform init
terraform plan -out=tfplan

# 3. Review planned changes
# Review output carefully before proceeding

# 4. Create infrastructure
terraform apply tfplan
# Wait 5-10 minutes

# 5. Get endpoints
terraform output
# Note the API Gateway URL and CloudFront domain

# 6. Build and deploy frontend
cd ../../client
npm run build
aws s3 sync dist/ s3://your-bucket-name/

# 7. Test deployment
curl https://your-api-gateway-url/api/stocks/market/overview
# Should return JSON data

# 8. Monitor
# AWS Console → CloudWatch → Log Groups
```

---

## Post-Deployment Checklist

### Verification

- [ ] **Frontend loads** without errors
- [ ] **Search works** - can search for stocks
- [ ] **API responses** are fast (<2s)
- [ ] **Watchlist** persists across page reloads
- [ ] **Charts** render correctly
- [ ] **Sentiment badges** display properly
- [ ] **Mobile responsive** - test on mobile browser
- [ ] **No console errors** in DevTools

### Monitoring

- [ ] **Logs checked** - CloudWatch (AWS) or Vercel logs
- [ ] **Error rate** acceptable (<1%)
- [ ] **Response times** good (<3s)
- [ ] **Database** - collections populated
- [ ] **External APIs** - responding normally

### Performance

```bash
# Check build size (should be <500KB)
cd client && npm run build
# Check dist/ folder size

# Browser DevTools - Network tab
# - Index.html: <50KB
# - Bundle: <300KB
# - Images: optimized
```

### Security Test

```bash
# 1. Check security headers
curl -I https://yoursite.com
# Should see: X-Content-Type-Options, X-Frame-Options, etc.

# 2. Check CORS
curl -H "Origin: https://other-site.com" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Content-Type: application/json" \
  https://yourapi.com/api/stocks/AAPL
# Should return CORS error (good!)

# 3. Check authentication
curl https://yourapi.com/api/admin
# Should return 404 or 403, not 500
```

---

## Rollback Plan

If something goes wrong:

### Vercel
```bash
# Redeploy previous version
# Dashboard → Deployments → Select previous → Redeploy
```

### AWS
```bash
# Destroy infrastructure and redeploy
cd aws/terraform
terraform destroy
terraform apply tfplan
```

### Local/Git
```bash
# Revert last commit
git revert HEAD
git push origin main
```

---

## Post-Launch Monitoring

### Daily Checks
- [ ] Error rate in logs
- [ ] No API rate limits hit
- [ ] Response times normal
- [ ] Database size growing as expected

### Weekly Checks
- [ ] Review error trends
- [ ] Check API quota usage
- [ ] Verify backups working
- [ ] Review security logs

### Monthly Checks
- [ ] Dependency updates available
- [ ] Security audit: `npm audit`
- [ ] Cost optimization (AWS)
- [ ] Performance metrics review

---

## Known Issues to Watch

1. **Gemini Quota Exceeded**
   - Expected after ~100 API calls/minute on free tier
   - Solution: Wait 1 hour for quota reset

2. **Alpha Vantage Rate Limit**
   - Free tier: 5 calls/minute
   - Solution: Already handled with delays in code

3. **MongoDB Connection Drops**
   - May happen during maintenance
   - Solution: Auto-reconnects enabled

4. **Watchlist Sessions Expire**
   - Sessions last 30 days
   - Solution: Expected behavior

---

## Support

- **Deployment questions**: Check [aws/DEPLOYMENT.md](aws/DEPLOYMENT.md)
- **Errors**: Search logs or GitHub Issues
- **Performance**: Check troubleshooting section in README

---

**Last Updated:** January 2026
