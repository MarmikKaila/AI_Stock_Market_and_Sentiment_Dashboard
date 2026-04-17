# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please **do not** open a public GitHub issue. Instead, please follow these steps:

### Reporting Process

1. **Email Security Report** to: [maintainer email from GitHub profile]
   - Subject: `[SECURITY] AI Stock Market Sentiment Dashboard Vulnerability`
   - Include:
     - Description of the vulnerability
     - Steps to reproduce
     - Potential impact
     - Suggested fix (if available)

2. **Wait for Response** - We will acknowledge your report within 48 hours

3. **Responsible Disclosure** - We will:
   - Investigate the vulnerability
   - Develop a fix
   - Create a security patch release
   - Credit you (if desired) in the release notes

### Security Best Practices for Users

#### API Key Management

```bash
# ✅ DO: Store keys in environment variables
GEMINI_API_KEY=$(aws secretsmanager get-secret-value --secret-id gemini-key)

# ❌ DON'T: Hardcode keys in source code
const API_KEY = "AIza..."; // NEVER!

# ❌ DON'T: Commit .env files to git
git add .env  # DANGER!

# ✅ DO: Use .env.example for templates
cp .env.example .env
```

#### Deployment Security

**Local Development:**
- Use only for development/testing
- Don't expose to public internet
- Rotate keys every 90 days

**Production (Vercel/AWS):**
- Use environment variables from platform
- Enable HTTPS only
- Use AWS Secrets Manager for key rotation
- Enable CloudWatch logging
- Set up automated backups
- Use VPC security groups

#### Input Validation

All user inputs are validated:
- Stock symbols: `^[A-Z]{1,5}$` (5 uppercase letters max)
- Session IDs: UUID format validation
- Watchlist size: Max 20 symbols per user
- Request size: 10KB max body

#### Rate Limiting

```
Global API: 100 requests per 15 minutes per IP
AI endpoint: 20 requests per 15 minutes per IP
```

Helps prevent:
- Brute force attacks
- DDoS attacks
- API quota exhaustion
- Cost explosion

#### CORS Configuration

```javascript
// Strict origin whitelist
const allowedOrigins = [
  'https://yourdomain.com',
  'https://app.yourdomain.com'
];

// ❌ WRONG: app.use(cors()); // Allow all
// ✅ RIGHT: Configure specific origins
app.use(cors({ origin: allowedOrigins }));
```

### Data Protection

- **Database**: MongoDB with encryption at rest
- **Transit**: HTTPS/TLS for all communications
- **Sessions**: Session IDs expire after 30 days of inactivity
- **No PII**: This app never stores personal information
- **No Payment Data**: Free tier only, no transactions

### Dependency Security

We use:
- `npm audit` to check for vulnerabilities
- Dependabot for automatic updates (GitHub)
- Regular manual reviews of critical dependencies

```bash
# Check for vulnerabilities
npm audit

# Fix known vulnerabilities
npm audit fix
```

### External API Security

We trust these providers:
- **MongoDB Atlas** - GDPR/HIPAA compliant
- **Google Gemini** - Google's security standards
- **Alpha Vantage** - Established finance provider
- **NewsAPI** - Reputable news aggregator

Each API call includes:
- Rate limiting
- Timeout protection
- Error handling
- Graceful fallbacks

### Logging & Monitoring

- **Local**: Console logs (development only)
- **Production**: CloudWatch logs (AWS)
- **Never logged**: API keys, passwords, sensitive data

### Incident Response

If a security issue is discovered:
1. Immediate patch release
2. Security advisory post
3. User notification (if applicable)
4. Root cause analysis
5. Prevention measures

---

## Known Limitations

⚠️ **Session-Based (No Authentication)**
- Watchlists tied to browsers, not accounts
- No user login required (by design)
- Watchlists auto-expire after 30 days

⚠️ **Free Tier Rate Limits**
- Alpha Vantage: 5 calls/min
- NewsAPI: 100 calls/day
- Gemini: ~100 calls/min

⚠️ **No Guarantees**
- Provided "as-is" for educational purposes
- Not financial advice
- Always validate recommendations independently

---

## Security Checklist for Deployment

- [ ] All `.env` files removed from git
- [ ] `.env.example` contains only placeholders
- [ ] Helmet enabled for security headers
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled
- [ ] Input validation on all routes
- [ ] HTTPS enforced in production
- [ ] MongoDB Atlas IP whitelisting configured
- [ ] API keys rotated recently
- [ ] Secrets Manager configured (AWS)
- [ ] CloudWatch logging enabled
- [ ] Database backups enabled
- [ ] Security.md in repository

---

## Contact

- **Security Issues**: [Email from GitHub]
- **General Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Last Updated:** January 2026  
**Version:** 1.0.0
