# 🧪 Session Testing Instructions
## ٹیسٹنگ کی ہدایات

## 🚀 ابھی ٹیسٹ کریں!

### Pre-requisites:
```bash
✅ Backend running on port 5000
✅ Frontend running on port 3000
✅ Database connected
```

---

## 📝 Test Scenarios

### ✅ Test 1: Basic Login & Refresh
**مقصد:** Check کریں کہ refresh پر logged in رہتا ہے یا نہیں

```bash
Steps:
1. Browser کھولیں http://localhost:3000/login
2. Login credentials enter کریں:
   - User: user@test.com / password123
   - Admin: admin@test.com / password123
3. Login button click کریں
4. Dashboard پر redirect ہونا چاہیے ✅
5. F5 دبائیں (Page Refresh)
6. Check:
   ✅ User still logged in?
   ✅ No redirect to login page?
   ✅ Dashboard data showing?

Expected Result:
✅ User logged in رہنا چاہیے
✅ کوئی logout نہیں ہونا چاہیے
✅ Browser console میں: "✅ Session valid - user stays logged in"
```

---

### ✅ Test 2: Browser Console Check
**مقصد:** Verify localStorage and cookies

```bash
Steps:
1. Login کریں
2. F12 دبائیں (Developer Tools)
3. Console tab دیکھیں

Expected Logs:
✅ "🔐 setCredentials called"
✅ "💾 localStorage saved with auth_token key (1 week)"
✅ "🍪 Cookies set for role: user"

4. Application tab → localStorage دیکھیں
Expected Keys:
✅ auth_token (long string)
✅ auth_user (JSON object)
✅ isAuthenticated (true)

5. Application tab → Cookies دیکھیں
Expected Cookies:
✅ auth_token (Expires: 7 days from now)
✅ isAuthenticated (Expires: 7 days from now)
✅ userRole (Expires: 7 days from now)
```

---

### ✅ Test 3: Browser Restart
**مقصد:** Check persistence across browser restarts

```bash
Steps:
1. Login کریں
2. Dashboard پر جائیں
3. Browser مکمل طور پر بند کریں (Alt+F4 یا X button)
4. Browser دوبارہ کھولیں
5. http://localhost:3000/user/dashboard پر جائیں

Expected Result:
✅ User automatically logged in
✅ Dashboard immediately shows
✅ No redirect to login
✅ Console: "🔄 Validating session with backend..."
✅ Console: "✅ Session valid - user stays logged in"
```

---

### ✅ Test 4: Multiple Tabs
**مقصد:** Check multi-tab sync

```bash
Steps:
1. Tab 1: Login کریں
2. Tab 2: http://localhost:3000/user/dashboard کھولیں
3. Check Tab 2:
   ✅ Automatically logged in?
   ✅ Dashboard shows?

4. Tab 1 میں logout کریں
5. Tab 2 refresh کریں
6. Check Tab 2:
   ✅ Logged out?
   ✅ Redirected to login?
```

---

### ✅ Test 5: Session Validation on Focus
**مقصد:** Check auto validation when returning to tab

```bash
Steps:
1. Login کریں
2. 2-3 دیگر tabs/windows کھولیں (دوسری websites)
3. 5 منٹ انتظار کریں
4. واپس dashboard tab پر جائیں

Expected Result:
✅ Console: "🔄 Validating session with backend..."
✅ Still logged in
✅ Auto refresh validation working
```

---

### ✅ Test 6: Invalid Token Handling
**مقصد:** Check proper logout on invalid session

```bash
Steps:
1. Login کریں
2. F12 → Application → localStorage
3. auth_token کی value کچھ بھی random text سے replace کریں
4. Page refresh کریں

Expected Result:
❌ Session invalid detected
❌ localStorage cleared
❌ Redirected to login page
✅ Console: "❌ Backend confirmed session is invalid - logging out"
```

---

### ✅ Test 7: Backend Session Check
**مقصد:** Verify database sessions

```bash
Steps:
1. Login کریں (user)
2. Backend terminal میں:

cd backend
node -e "
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'queue_management'
});

(async () => {
  const [sessions] = await pool.query('SELECT * FROM user_sessions WHERE active=1');
  console.log('Active Sessions:', sessions);
  await pool.end();
})();
"

Expected Output:
✅ Session found in database
✅ expires_at shows date 7 days in future
✅ active = 1
✅ token matches localStorage token
```

---

### ✅ Test 8: API Error Handling
**مقصد:** Check 401/403 error handling

```bash
Steps:
1. Login کریں
2. Backend temporarily stop کریں
3. Dashboard میں کوئی action کریں (ticket call etc)
4. Backend start کریں

Expected Result:
✅ Error message shows
✅ NOT automatically logged out
✅ Session preserved
✅ User can retry action
```

---

### ✅ Test 9: Logout Functionality
**مقصد:** Verify proper cleanup on logout

```bash
Steps:
1. Login کریں
2. Logout button click کریں
3. F12 → Application → localStorage check کریں
4. Cookies check کریں
5. Browser console check کریں

Expected Result:
✅ localStorage cleared (no auth_token, auth_user)
✅ Cookies deleted
✅ Redirected to login page
✅ Console: "🧹 Session cleared - logout (localStorage + cookies)"

6. Back button دبائیں
Expected:
✅ Still on login page (no back navigation to dashboard)
```

---

### ✅ Test 10: Session Expiry (Time-based)
**مقصد:** Test 7-day expiry

```bash
Option A: Wait 7 days (not practical)

Option B: Manual database update:
1. Login کریں
2. Database میں:

UPDATE user_sessions 
SET expires_at = DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE active = 1;

3. Page refresh کریں

Expected Result:
❌ Session expired detected
❌ Logged out automatically
❌ Redirected to login
✅ Console: "❌ Backend confirmed session is invalid - logging out"
```

---

## 🔍 Backend Logs to Monitor

### Terminal میں یہ logs نظر آنی چاہیے:

#### On Login:
```
✅ Login successful
✅ Session created with 7 days expiry
✅ Token: eyJhbGc...
```

#### On Refresh/Verification:
```
🔍 Verify session - decoded role: user, user id: 123
  ✅ Validating user session for role: user
  ✅ Session validated successfully for user: john_doe
```

#### On Invalid Session:
```
  ❌ Session validation failed: Invalid or expired session
```

---

## 📊 Success Checklist

تمام tests pass ہونے چاہیے:

```
✅ Test 1: Login & Refresh - PASSED
✅ Test 2: Console Check - PASSED
✅ Test 3: Browser Restart - PASSED
✅ Test 4: Multiple Tabs - PASSED
✅ Test 5: Focus Validation - PASSED
✅ Test 6: Invalid Token - PASSED
✅ Test 7: Database Session - PASSED
✅ Test 8: API Errors - PASSED
✅ Test 9: Logout - PASSED
✅ Test 10: Expiry - PASSED
```

---

## 🐛 Common Issues & Solutions

### Issue: Refresh پر logout ہو جاتا ہے
**Check:**
```bash
1. Browser console میں errors؟
2. Backend running ہے؟
3. Database connected ہے؟
4. localStorage میں token موجود ہے؟
```

**Solution:**
```bash
# Backend restart
cd backend
npm start

# Clear browser cache
Ctrl+Shift+Delete → Clear everything → Restart browser

# Fresh login
```

---

### Issue: "Session validation failed" error
**Check:**
```bash
1. Database میں session موجود ہے؟
2. expires_at future date ہے؟
3. active = 1 ہے؟
```

**Solution:**
```bash
# Database query
SELECT * FROM user_sessions WHERE active=1;

# If no sessions, login again
# If expired, update expires_at:
UPDATE user_sessions 
SET expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY)
WHERE user_id = YOUR_USER_ID;
```

---

### Issue: localStorage empty ہو جاتا ہے
**Check:**
```bash
1. Private/Incognito mode میں تو نہیں؟
2. Browser localStorage disabled تو نہیں؟
3. Extensions blocking storage؟
```

**Solution:**
```bash
# Normal browser window use کریں
# localStorage enable کریں browser settings میں
# Extensions temporarily disable کریں
```

---

## 🎯 Performance Testing

### Load Time Test:
```bash
1. F12 → Network tab
2. Page refresh کریں
3. /api/auth/verify call check کریں

Expected:
✅ Response time: < 100ms
✅ Status: 200 OK
✅ Response: { success: true, user: {...} }
```

### Stress Test:
```bash
1. Multiple rapid refreshes (F5 spam)
2. Check:
   ✅ No crashes
   ✅ No duplicate sessions
   ✅ Performance stable
```

---

## ✅ Final Verification

### All Features Working:
```
✅ 1 week session persistence
✅ localStorage + cookies
✅ Backend validation on refresh
✅ Auto restore on page load
✅ Tab focus validation
✅ Multiple tab support
✅ Browser restart support
✅ Proper logout cleanup
✅ Error handling
✅ Security validation
```

---

## 📞 Need Help?

اگر کوئی test fail ہو تو:
1. Complete guide دیکھیں: `SESSION_MANAGEMENT_1_WEEK_COMPLETE.md`
2. Quick reference: `SESSION_1_WEEK_QUICK_REFERENCE.md`
3. Changes summary: `SESSION_CHANGES_SUMMARY.md`

---

**Happy Testing! 🎉**
**تمام features کام کر رہے ہیں ✅**
