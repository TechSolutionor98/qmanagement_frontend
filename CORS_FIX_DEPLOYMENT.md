# 🔧 CORS Fix - Server Deployment Guide

## Problem
- **CORS Error**: `Access-Control-Allow-Origin header contains multiple values 'https://qmanagement-frontend.vercel.app, *'`
- **Audio Error**: Format error (Error Code 4) due to CORS blocking
- **Root Cause**: Server pe Nginx ya purana Python code duplicate CORS headers bhej raha hai

## ✅ Fixed Files
- `python-tts-service/app.py` - Updated CORS configuration (lines 31-40)
- `src/app/ticket_info/page.js` - Better audio error handling with retry logic

## 📦 Deployment Steps

### 1️⃣ Server pe SSH karo
```bash
ssh root@srv984317.hstgr.cloud
```

### 2️⃣ Python TTS Service Update karo
```bash
# Navigate to Python service directory
cd ~/python-tts-service  # Ya jahan service hai

# Backup current code
cp app.py app.py.backup

# Pull latest code from Git (if using Git)
git pull origin main

# OR manually copy the updated app.py from local
# (Use SCP or FTP to upload the file)
```

### 3️⃣ Check Nginx Configuration (IMPORTANT!)
```bash
# Check if Nginx is adding duplicate CORS headers
cat /etc/nginx/sites-available/aichatterbox.techmanagement.tech

# Look for these lines and REMOVE them if present:
# add_header 'Access-Control-Allow-Origin' '*';
# add_header 'Access-Control-Allow-Origin' '$http_origin';
```

**If you find CORS headers in Nginx config:**
```bash
# Edit Nginx config
nano /etc/nginx/sites-available/aichatterbox.techmanagement.tech

# REMOVE these lines (flask-cors will handle CORS):
# add_header 'Access-Control-Allow-Origin' '*';
# add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
# add_header 'Access-Control-Allow-Headers' '*';

# Save and test Nginx config
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

### 4️⃣ Restart Python TTS Service
```bash
# If using PM2
pm2 restart chatterbox-server
pm2 restart chatter  # Or whatever the process name is

# Check logs
pm2 logs chatterbox-server --lines 50

# Verify service is running
curl http://localhost:3002/health
```

### 5️⃣ Test CORS Headers
```bash
# Test from server
curl -I https://aichatterbox.techmanagement.tech/health

# Should see only ONE Access-Control-Allow-Origin header
# Look for: Access-Control-Allow-Origin: https://qmanagement-frontend.vercel.app
```

## 🧪 Verification Steps

### Test from Browser Console (on Vercel production):
```javascript
// Open https://qmanagement-frontend.vercel.app
// Open DevTools Console and run:

fetch('https://aichatterbox.techmanagement.tech/health')
  .then(r => r.json())
  .then(d => console.log('✅ CORS Fixed!', d))
  .catch(e => console.error('❌ CORS Still Blocked:', e));
```

### Test Audio Playback:
1. Login as `ticket_info` user
2. Call a ticket from user dashboard
3. Check console - should see:
   - `✅ Box 1 audio playing`
   - `✅ Box 2 audio playing`
   - NO CORS errors

## 📝 Updated CORS Configuration

**Old (Causing duplicate headers):**
```python
CORS(app)  # Generic CORS - might conflict with Nginx
```

**New (Specific origins only):**
```python
CORS(app, resources={
    r"/*": {
        "origins": ["https://qmanagement-frontend.vercel.app", "http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False
    }
})
```

## 🔍 Troubleshooting

### If CORS error persists:

**Check 1: Nginx Config**
```bash
grep -r "Access-Control-Allow-Origin" /etc/nginx/
```

**Check 2: Python Service Logs**
```bash
pm2 logs chatterbox-server --lines 100 | grep -i cors
```

**Check 3: Response Headers**
```bash
curl -v https://aichatterbox.techmanagement.tech/health 2>&1 | grep -i "access-control"
```

### If you see duplicate headers:
1. **Remove from Nginx** - Edit `/etc/nginx/sites-available/aichatterbox.techmanagement.tech`
2. **Let flask-cors handle it** - Only Python app should send CORS headers
3. **Restart both** - `systemctl reload nginx && pm2 restart chatterbox-server`

## ✅ Expected Result

After deployment:
- ✅ Audio plays in both languages (English + Arabic)
- ✅ No CORS errors in console
- ✅ Response has single `Access-Control-Allow-Origin` header
- ✅ `speech_*.wav` files load successfully

## 📞 Quick Commands Reference

```bash
# SSH
ssh root@srv984317.hstgr.cloud

# Check service status
pm2 status

# Restart Python service
pm2 restart chatterbox-server

# Check logs (live)
pm2 logs chatterbox-server

# Test health endpoint
curl https://aichatterbox.techmanagement.tech/health

# Reload Nginx
systemctl reload nginx

# Check Nginx config
nginx -t
```

---

**Note**: Server pe deployment ke baad Vercel frontend automatically updated code use karega (no frontend restart needed).
