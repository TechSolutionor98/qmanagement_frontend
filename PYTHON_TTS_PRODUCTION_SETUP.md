# 🎙️ Python TTS Service Production Setup Guide

## ❌ **Current Problem:**

Production backend se Python TTS service offline dikhta hai:
```
https://queapi.techmanagement.tech/api/voices/health
→ "python_service": "offline"
```

Localhost pe working hai:
```
http://localhost:5000/api/voices/health
→ "python_service": "online" ✅
```

## 🔍 **Root Cause:**

Production server pe Python TTS service nahi chal rahi ya backend usko access nahi kar pa raha.

---

## ✅ **Solution - 3 Options:**

### **Option 1: Python Service Production Server Pe Run Karein** (Recommended)

#### **1.1 Python Service Deploy Karein:**

```bash
# Server pe SSH karein
ssh user@queapi.techmanagement.tech

# Project directory me jayen
cd /path/to/que-management

# Python service install karein
cd python-tts-service
pip install -r requirements.txt

# Service ko background me run karein (using screen or pm2)
screen -S python-tts
python app.py
# Ctrl+A, D to detach
```

#### **1.2 Backend .env Update Karein:**

Production server pe backend `.env` file me:
```bash
PYTHON_TTS_URL=http://localhost:3002
```

Ya agar alag server pe hai:
```bash
PYTHON_TTS_URL=http://internal-ip:3002
```

#### **1.3 PM2 se Run Karein (Better):**

```bash
# PM2 install karein
npm install -g pm2

# Python service start karein
cd python-tts-service
pm2 start app.py --name python-tts --interpreter python3

# Auto-restart enable karein
pm2 startup
pm2 save
```

---

### **Option 2: Python Service Ko Separate Server Pe Host Karein**

Agar Python service alag server pe hai:

#### **2.1 Python Service Ko Public URL De Dein:**

```bash
# Nginx reverse proxy setup (on Python service server)
server {
    listen 80;
    server_name python-tts.techmanagement.tech;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### **2.2 Backend .env Update:**

```bash
PYTHON_TTS_URL=http://python-tts.techmanagement.tech
```

---

### **Option 3: Docker Container (Advanced)**

```dockerfile
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PYTHON_TTS_URL=http://python-tts:3002
    depends_on:
      - python-tts

  python-tts:
    build: ./python-tts-service
    ports:
      - "3002:3002"
```

```bash
docker-compose up -d
```

---

## 🧪 **Testing Steps:**

### **1. Check Python Service Directly:**

```bash
# Server pe test karein
curl http://localhost:3002/health

# Expected:
{
    "status": "healthy",
    "models_loaded": false,
    "timestamp": "..."
}
```

### **2. Check Backend Connection:**

```bash
# Backend se test karein
curl http://localhost:5000/api/voices/health

# Expected:
{
    "status": "ok",
    "python_service": "online"
}
```

### **3. Check Public URL:**

```bash
curl https://queapi.techmanagement.tech/api/voices/health

# Should show "online" now ✅
```

---

## 🔧 **Backend Route Fix (Already Done):**

Backend `routes/voices.js` me ye check already hai:

```javascript
const PYTHON_TTS_URL = process.env.PYTHON_TTS_URL || 'http://localhost:3002';

router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_TTS_URL}/health`, {
      timeout: 5000
    });
    
    res.json({
      status: 'ok',
      success: true,
      python_service: 'online',
      data: response.data
    });
  } catch (error) {
    res.json({
      status: 'error',
      success: false,
      python_service: 'offline',
      message: 'TTS service is not running'
    });
  }
});
```

---

## 📝 **Quick Fix Checklist:**

- [ ] Python service production server pe chal rahi hai
- [ ] Port 3002 accessible hai (firewall check karein)
- [ ] Backend `.env` me `PYTHON_TTS_URL` set hai
- [ ] Backend service restart kiya
- [ ] Health endpoint test kiya
- [ ] Voice synthesis test kiya

---

## 🚨 **Common Issues:**

### **Issue 1: Port 3002 blocked**
```bash
# Firewall me port open karein
sudo ufw allow 3002
```

### **Issue 2: Python dependencies missing**
```bash
cd python-tts-service
pip install -r requirements.txt
```

### **Issue 3: Service crash ho rahi hai**
```bash
# Logs check karein
pm2 logs python-tts
# Ya
tail -f /var/log/python-tts.log
```

---

## ✅ **Expected Result:**

```bash
# ✅ Test kar ke dekhen
curl https://queapi.techmanagement.tech/api/voices/health

{
    "status": "ok",
    "success": true,
    "python_service": "online",  ← This should be "online"
    "data": {
        "status": "healthy",
        "models_loaded": false,
        "timestamp": "2025-12-23T..."
    }
}
```

---

## 💡 **Recommended Setup:**

**Best Practice:** Python service ko PM2 se run karein backend ke saath same server pe:

```bash
# Backend server pe
cd /path/to/que-management

# Backend start karein
cd backend
pm2 start server.js --name backend

# Python TTS start karein
cd ../python-tts-service
pm2 start app.py --name python-tts --interpreter python3

# Dono services check karein
pm2 list

# Auto-restart enable karein
pm2 startup
pm2 save
```

Is tarah dono services ek saath chalegi aur auto-restart hogi! 🚀
