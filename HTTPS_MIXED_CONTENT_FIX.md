# 🔒 HTTPS Mixed Content Fix Guide

## ❌ Problem
Your frontend (Vercel) uses HTTPS, but your backend API uses HTTP, causing browsers to block requests.

## ✅ Solution Steps

### 1. **Enable HTTPS on Backend Server** (CRITICAL)

Your backend at `queapi.techmanagement.tech` must support HTTPS. You have 3 options:

#### Option A: Use Cloudflare (Recommended - Free)
1. Add your domain to Cloudflare
2. Enable SSL/TLS encryption (Full or Flexible mode)
3. Cloudflare will handle HTTPS automatically
4. Update DNS to point to Cloudflare

#### Option B: Use Let's Encrypt SSL Certificate
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d queapi.techmanagement.tech

# Auto-renewal (runs automatically)
sudo certbot renew --dry-run
```

#### Option C: Use Reverse Proxy (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name queapi.techmanagement.tech;
    
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. **Update Vercel Environment Variables**

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these variables:
- `NEXT_PUBLIC_API_URL` = `https://queapi.techmanagement.tech/api`
- `NEXT_PUBLIC_API_URL_WS` = `https://queapi.techmanagement.tech`
- `NODE_ENV` = `production`

### 3. **Redeploy on Vercel**

After setting environment variables:
```bash
# Commit and push
git add .
git commit -m "Update to HTTPS endpoints"
git push origin main

# Or trigger manual redeploy in Vercel dashboard
```

### 4. **Verify Backend HTTPS Works**

Test in browser or curl:
```bash
curl https://queapi.techmanagement.tech/api/health
```

Should return a valid response without SSL errors.

## 🔧 Backend CORS Update (If Using Express)

Update your backend CORS to allow HTTPS:

```javascript
// backend/server.js or app.js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://qmanagement-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

## 📝 Local Development

For local development, create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_URL_WS=http://localhost:5000
NEXT_PUBLIC_PYTHON_TTS_URL=http://localhost:3002
NODE_ENV=development
```

## ✔️ Verification Checklist

- [ ] Backend API accessible via HTTPS
- [ ] SSL certificate valid (no browser warnings)
- [ ] Vercel environment variables updated
- [ ] Frontend redeployed on Vercel
- [ ] Login works without mixed content errors
- [ ] API calls succeed in browser console
- [ ] Backend CORS allows Vercel domain

## 🚨 Quick Test

Open browser console on `https://qmanagement-frontend.vercel.app`:

```javascript
fetch('https://queapi.techmanagement.tech/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should work without CORS or mixed content errors.

## 🔍 Common Issues

### Issue: "SSL certificate problem"
**Fix**: Get a valid SSL certificate (Let's Encrypt is free)

### Issue: "CORS policy error"
**Fix**: Update backend CORS to allow your Vercel URL

### Issue: "Still showing HTTP"
**Fix**: Clear Vercel build cache and redeploy

### Issue: "Works locally but not on Vercel"
**Fix**: Check Vercel environment variables are set correctly

---

## 🎯 Priority Actions (Do These NOW)

1. **Enable HTTPS on `queapi.techmanagement.tech`** (use Cloudflare for easiest setup)
2. **Set Vercel environment variables** with HTTPS URLs
3. **Redeploy** your Vercel app
4. **Test** the login functionality

Without HTTPS on your backend, the app will NOT work on Vercel (or any HTTPS site).
