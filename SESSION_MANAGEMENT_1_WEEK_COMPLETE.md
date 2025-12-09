# 🔐 Session Management 1 Week Setup - Complete Guide
## سیشن مینجمنٹ 1 ہفتے کی مکمل گائیڈ

## ✅ کیا تبدیلیاں کی گئی ہیں؟

### 1. **localStorage + Cookies استعمال** (1 ہفتے کی persistence)
- **پہلے:** sessionStorage استعمال ہوتا تھا (صرف browser tab بند ہونے تک)
- **اب:** localStorage + cookies استعمال ہوتے ہیں (1 ہفتے تک persist)
- جب user login کرتا ہے تو data دونوں جگہ save ہوتا ہے

### 2. **Backend Session Validation پر Refresh**
- **پہلے:** کوئی بھی 401/403 error آئے تو فوراً logout
- **اب:** پہلے backend سے verify کریں گے کہ session valid ہے یا نہیں
- اگر backend session valid ہے تو user logged in رہے گا

### 3. **Automatic Session Check on Refresh**
- جب بھی page refresh ہو یا tab focus ہو
- Backend سے session validation check ہوگی
- اگر valid ہے تو user logged in رہے گا

### 4. **7 Days (1 Week) Session Expiry**
- Backend پر sessions 7 دن تک valid رہیں گی
- Frontend localStorage میں 7 دن تک data save رہے گا
- Cookies بھی 7 دن کی expiry کے ساتھ set ہیں

## 📁 تبدیل شدہ فائلیں

### 1. `src/utils/sessionStorage.js`
```javascript
✅ localStorage استعمال (sessionStorage کی جگہ)
✅ Cookie support شامل
✅ verifySessionWithBackend() function شامل
✅ clearSessionData() صرف backend confirm کرنے کے بعد
```

### 2. `src/utils/axiosInstance.js`
```javascript
✅ 401/403 errors پر backend verification پہلے
✅ صرف invalid session پر logout
✅ Valid session پر user logged in رہے گا
```

### 3. `src/store/store.js`
```javascript
✅ localStorage سے state load
✅ 1 ہفتے کی persistence
```

### 4. `src/store/slices/authSlice.js`
```javascript
✅ localStorage میں save
✅ 7 دن کی cookie expiry
✅ Logout پر localStorage + cookies clear
```

### 5. `src/components/SessionValidator.js` (نیا)
```javascript
✅ ہر page load پر backend validation
✅ Tab focus پر automatic check
✅ Valid session پر auto restore
```

### 6. `src/app/layout.js`
```javascript
✅ SessionValidator component شامل
✅ ہر page پر automatic validation
```

## 🔄 کیسے کام کرتا ہے؟

### Login Process:
```
1. User login کرتا ہے
   ↓
2. Backend session create کرتا ہے (7 days expiry)
   ↓
3. Token localStorage + cookies میں save ہوتا ہے
   ↓
4. User data persist ہوتا ہے 1 ہفتے کے لیے
```

### Page Refresh Process:
```
1. User page refresh کرتا ہے
   ↓
2. SessionValidator localStorage سے token check کرتا ہے
   ↓
3. Backend سے /api/auth/verify call کرتا ہے
   ↓
4. اگر valid: User logged in رہتا ہے ✅
5. اگر invalid: Logout ہو جاتا ہے ❌
```

### Error Handling (401/403):
```
1. API call سے 401/403 error آتی ہے
   ↓
2. axiosInstance interceptor backend سے verify کرتا ہے
   ↓
3. اگر backend session valid: User logged in رہے گا
4. اگر backend session invalid: Clear data & logout
```

## 🧪 ٹیسٹنگ گائیڈ

### Test 1: Login اور Refresh
```bash
1. Login کریں
2. Page refresh کریں (F5)
3. User logged in رہنا چاہیے ✅
4. کوئی redirect نہیں ہونا چاہیے
```

### Test 2: Multiple Tab
```bash
1. Tab 1 میں login کریں
2. Tab 2 کھولیں same URL
3. دونوں tabs میں logged in رہنا چاہیے ✅
```

### Test 3: Browser Restart
```bash
1. Login کریں
2. Browser مکمل بند کریں
3. Browser دوبارہ کھولیں
4. Same URL جائیں
5. User logged in رہنا چاہیے (1 ہفتے تک) ✅
```

### Test 4: Session Expiry (7 days بعد)
```bash
1. Login کریں
2. 7 دن انتظار کریں (یا backend میں expires_at change کریں)
3. Page refresh کریں
4. Logout ہو جانا چاہیے ❌
5. Login page پر redirect ہونا چاہیے
```

### Test 5: Invalid Token
```bash
1. Login کریں
2. localStorage سے auth_token manually delete کریں
3. Page refresh کریں
4. Login page پر redirect ہونا چاہیے ❌
```

## 🔐 Security Features

### 1. **Automatic Session Validation**
- ہر page load پر backend سے verify
- Tab focus پر automatic check
- Expired sessions auto clear

### 2. **Multiple Storage**
- localStorage (primary)
- Cookies (backup)
- دونوں sync رہتے ہیں

### 3. **Backend Control**
- Backend sessions database میں store
- Server-side expiry validation
- Manual session revoke کی سہولت

## 📊 Backend Session Database

### admin_sessions Table:
```sql
- session_id
- admin_id
- token
- expires_at (7 days)
- active (1/0)
- last_activity
```

### user_sessions Table:
```sql
- session_id
- user_id
- token
- expires_at (7 days)
- active (1/0)
- last_activity
```

## 🚀 Production Deployment

### Environment Variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
JWT_SECRET=your-secret-key
```

### Build Commands:
```bash
# Frontend
cd que-management
npm run build
npm start

# Backend
cd backend
npm start
```

## 🛠️ Troubleshooting

### مسئلہ: Refresh پر logout ہو جاتا ہے
**حل:**
1. Browser console check کریں
2. localStorage میں auth_token موجود ہے؟
3. Backend /api/auth/verify endpoint کام کر رہی ہے؟
4. Backend session database میں موجود ہے؟

### مسئلہ: 7 days سے پہلے expire ہو جاتا ہے
**حل:**
1. Backend sessionManager.js میں expiry check کریں
2. Database میں expires_at column دیکھیں
3. System time sync check کریں

### مسئلہ: Multiple tabs میں sync نہیں ہو رہا
**حل:**
1. localStorage events check کریں
2. SessionValidator دونوں tabs میں run ہو رہا ہے؟
3. Cookies properly set ہو رہی ہیں؟

## 📝 Notes

1. **Session Cleanup**: Backend میں expired sessions auto delete ہو جاتے ہیں
2. **Concurrent Logins**: ایک user ایک ہی device پر ایک وقت میں login
3. **Security**: HTTPS استعمال کریں production میں
4. **Cookie Settings**: SameSite=Strict for security

## ✅ All Features Working

- ✅ 1 week session persistence
- ✅ localStorage + cookies
- ✅ Backend validation on refresh
- ✅ Auto session restore
- ✅ Proper logout on expiry
- ✅ Multiple tab support
- ✅ Browser restart persistence
- ✅ Secure token storage

## 🎉 کامیابی!

اب آپ کا queue management system مکمل طور پر:
- 1 ہفتے کی sessions کے ساتھ کام کرتا ہے
- Refresh پر logged in رہتا ہے
- Backend سے validate کرتا ہے
- localStorage + cookies استعمال کرتا ہے

---
**تاریخ:** 9 December 2025
**Version:** 1.0.0
**Status:** ✅ تمام features working
