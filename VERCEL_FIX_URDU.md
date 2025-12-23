# 🔧 Vercel Live Deployment Fix Guide (Urdu)

## ❌ **Masail (Problems):**
1. ✅ **Images 1 second ke baad gayab ho jati hain** - Slider theek hai, API URL ka issue hai
2. ✅ **Voice announcement nahi aa rahi** - HTTP URL browser block kar raha hai
3. ✅ **Mixed Content Error** - Vercel HTTPS use karta hai, backend HTTP hai

## ✅ **Solution Steps - ZAROOR FOLLOW KAREIN:**

### **Step 1: Vercel Dashboard mein Environment Variables Set Karein** ⚠️ BOHOT ZAROORI

1. **Is link pe jayen:** https://vercel.com/techsolutionor98/qmanagement-frontend/settings/environment-variables

2. **Purane variables DELETE karein** (agar hain to)

3. **Naye variables ADD karein** (ek ek kar ke):

```
Variable 1:
Name: NEXT_PUBLIC_API_URL
Value: https://queapi.techmanagement.tech/api
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Variable 2:
Name: NEXT_PUBLIC_API_URL_WS
Value: https://queapi.techmanagement.tech
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Variable 3:
Name: NODE_ENV
Value: production
Environments: ✅ Production (sirf production check karein)
```

### **Step 2: Vercel pe Redeploy Karein** 🚀

**Zaroor karna hai - warna kuch change nahi hoga!**

#### **Option A: Vercel Dashboard se (Recommended):**

1. Jayen: https://vercel.com/techsolutionor98/qmanagement-frontend
2. **"Deployments"** tab pe click karein
3. Latest deployment pe **"..."** (3 dots) pe click karein
4. **"Redeploy"** pe click karein
5. ⚠️ **IMPORTANT:** "Use existing Build Cache" ko **UNCHECK** karein (band kar dein)
6. **"Redeploy"** button dabayein
7. 2-3 minute wait karein deployment complete hone ka

#### **Option B: Git Push se:**

```powershell
cd "c:\Users\tech solutionor\Desktop\newquemanagementinnextjs\que-management"
git add .
git commit -m "Fix HTTPS URLs for Vercel production"
git push origin main
```

### **Step 3: Test Karein** 🧪

Deployment complete hone ke baad:

1. Browser console kholen (F12 dabayen)
2. Jayen: https://qmanagement-frontend.vercel.app/ticket-info-login
3. Login karein
4. **Check karein:**
   - ✅ Images dikhai de rahi hain (load ho rahi hain)
   - ✅ Voice announcement aa rahi hai
   - ✅ Console mein "Mixed Content" error NAHI hai
   - ✅ Network tab mein API calls `https://` se shuru hoti hain

### **Console mein Check Karein:**

Browser console mein type karein:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('API WS:', process.env.NEXT_PUBLIC_API_URL_WS);
```

Output hona chahiye:
```
API URL: https://queapi.techmanagement.tech/api
API WS: https://queapi.techmanagement.tech
```

---

## 🔍 **Agar Abhi Bhi Issue Ho:**

### **Issue 1: Images dikhai nahi de rahi**

**Reason:** API call fail ho rahi hai

**Fix:**
1. Browser console check karein (F12)
2. Network tab dekhen
3. Failed requests dekhen (red color)
4. Check karein URLs `https://` se shuru ho rahe hain

### **Issue 2: Voice nahi aa rahi**

**Reasons:**
- Python TTS service band hai
- Backend CORS settings galat hain
- Audio autoplay browser block kar raha hai

**Fix:**
```powershell
# Backend start karein
cd "c:\Users\tech solutionor\Desktop\newquemanagementinnextjs\que-management\backend"
node server.js

# Python TTS service start karein
cd ..\python-tts-service
python app.py
```

### **Issue 3: "Mixed Content" Error**

**Fix:** Vercel variables sahi set karein (upar Step 1 dekhen)

---

## 📋 **Quick Checklist:**

- [ ] Vercel environment variables set kiye ✅
- [ ] Build cache **disable** karke redeploy kiya ✅
- [ ] Deployment complete hui (2-3 min) ✅
- [ ] Browser cache clear kiya (Ctrl+Shift+Delete) ✅
- [ ] Fresh browser tab mein test kiya ✅
- [ ] Backend service chal rahi hai ✅
- [ ] Python TTS service chal rahi hai ✅

---

## 🎯 **Backend CORS Fix (Agar zarurat ho):**

Agar backend file `backend/server.js` ya `backend/app.js` mein CORS settings hain, to ye add karein:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://qmanagement-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

---

## 💡 **Important Points:**

1. **Vercel `.env` file nahi padhta** - Dashboard mein hi set karna padta hai
2. **Build cache clear karna zaroori hai** - warna purani values use hoti hain
3. **Backend HTTPS support karta hai** - maine test kar liya ✅
4. **Both pages ab theek hain** - horizontal aur vertical dono

---

## 🆘 **Agar Kuch Samajh Na Aaye:**

Mujhe batao, main step by step guide dunga!

**Files Updated:**
- ✅ `.env` - HTTPS URLs ke saath
- ✅ `.env.local` - Local development ke liye
- ✅ `ticket_info_horizontal/page.js` - Variables fix
- ✅ `ticket_info_vertical/page.js` - Variables fix

**AB BUS VERCEL DASHBOARD MEIN VARIABLES SET KARO AUR REDEPLOY KARO!** 🚀
