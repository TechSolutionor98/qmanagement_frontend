# ✅ User Session Fix - Counter Selection Required

## 🎯 Problem Fixed

**Before:** 
- User login hote hi session database me save ho jata tha
- Counter select karne se pehle hi session active ho jata tha ❌

**After:**
- User login karta hai → Temporary token milta hai (NO SESSION) ✅
- Counter select karta hai → Ab session create hota hai ✅
- Session me counter number save hota hai ✅

---

## 🔧 Changes Made

### 1. Backend - userLogin.js
**File:** `backend/controllers/auth/userLogin.js`

```javascript
// OLD CODE - Session immediately created ❌
const sessionResult = await createUserSession(...)
res.json({ token: sessionResult.token })

// NEW CODE - Only temp token for role='user' ✅
if (user.role !== 'user') {
  // Receptionist, etc - create session immediately
  const sessionResult = await createUserSession(...)
  sessionToken = sessionResult.token
} else {
  // User - temporary token, NO SESSION YET
  const tempToken = generateToken({ 
    id: user.id, 
    temporary: true  
  })
  sessionToken = tempToken
}
```

**Key Points:**
- ✅ Role='user' → Temporary token (no session)
- ✅ Role='receptionist' → Session created immediately
- ✅ Flag `needs_counter_selection: true` in response

---

### 2. Backend - setUserCounter.js
**File:** `backend/controllers/auth/setUserCounter.js`

```javascript
// NEW CODE - Session created HERE after counter selection ✅
const sessionResult = await createUserSession(
  userId,
  user.username,
  user.email,
  counter_no,  // NOW we have counter!
  user.admin_id,
  deviceInfo,
  ipAddress
)

res.json({
  success: true,
  counter_no,
  token: sessionResult.token  // NEW token with real session
})
```

**Key Points:**
- ✅ Session created ONLY after counter selection
- ✅ Counter number included in session
- ✅ Returns new token with active session
- ✅ Checks if counter already occupied

---

### 3. Frontend - login page.js
**File:** `src/app/login/page.js`

```javascript
// Updated counter selection handler
const handleCounterSelect = async (counterNo) => {
  const data = await fetch('/auth/user/set-counter', {...})
  
  // Store NEW token from session creation
  dispatch(setCredentials({
    user: { ...pendingUserData.user, counter_no: counterNo },
    token: data.token  // ← NEW token with session
  }))
}
```

**Key Points:**
- ✅ Uses new token returned after session creation
- ✅ Stores counter_no with user data
- ✅ Redirects to dashboard after successful assignment

---

## 🎬 Flow Diagram

### User Login Flow
```
1. User enters email/password
   ↓
2. Backend validates credentials ✅
   ↓
3. Backend generates TEMPORARY token (NO SESSION) 🎫
   ↓
4. Frontend receives: needs_counter_selection: true
   ↓
5. Frontend shows Counter Selection Modal 🎯
   ↓
6. User selects counter number
   ↓
7. Frontend calls /auth/user/set-counter with temp token
   ↓
8. Backend creates SESSION with counter number 💾
   ↓
9. Backend returns NEW TOKEN with active session ✅
   ↓
10. Frontend stores new token & redirects to dashboard 🎉
```

### Receptionist Login Flow
```
1. Receptionist enters email/password
   ↓
2. Backend validates credentials ✅
   ↓
3. Backend creates SESSION immediately (no counter needed) 💾
   ↓
4. Backend returns token with session ✅
   ↓
5. Frontend stores token & redirects to "/" 🎉
```

---

## 📊 Database Changes

### user_sessions Table
```sql
-- Session created ONLY after counter selection for users
CREATE TABLE user_sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(255),
  email VARCHAR(255),
  counter_no VARCHAR(50),  -- ← NOW filled AFTER selection
  admin_id INT,
  token VARCHAR(500) NOT NULL,
  device_info VARCHAR(255),
  ip_address VARCHAR(50),
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  active TINYINT(1) DEFAULT 1,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing Checklist

### Test 1: User Login (role='user')
- [ ] Login with user credentials
- [ ] Verify NO session in database yet
- [ ] Counter modal should appear
- [ ] Select counter
- [ ] Verify session created with counter_no
- [ ] Check session is active
- [ ] Refresh page - should stay logged in

### Test 2: Receptionist Login (role='receptionist')
- [ ] Login with receptionist credentials
- [ ] NO counter modal should appear
- [ ] Verify session created immediately
- [ ] Redirects to "/" page
- [ ] Session has no counter_no (NULL or empty)
- [ ] Refresh page - should stay logged in

### Test 3: Counter Already Occupied
- [ ] User1 logs in, selects Counter 5
- [ ] User2 logs in, tries Counter 5
- [ ] Should show error: "Counter already occupied"
- [ ] User2 selects Counter 6
- [ ] Should work ✅

### Test 4: Session Expiry
- [ ] User logs in with counter
- [ ] Session created with 7 days expiry
- [ ] After 7 days, session should be inactive
- [ ] User redirected to login

---

## 📝 SQL Queries for Testing

### Check User Sessions
```sql
SELECT 
  us.session_id,
  u.username,
  u.role,
  us.counter_no,
  us.login_time,
  us.expires_at,
  us.active,
  DATEDIFF(us.expires_at, NOW()) as days_remaining
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.active = 1
ORDER BY us.login_time DESC;
```

### Check Sessions by Counter
```sql
SELECT 
  counter_no,
  username,
  email,
  login_time,
  active
FROM user_sessions
WHERE counter_no IS NOT NULL 
  AND active = 1 
  AND expires_at > NOW()
ORDER BY counter_no;
```

### Clear All Sessions (Testing)
```sql
UPDATE user_sessions SET active = 0;
```

---

## 🚨 Important Notes

1. **Temporary Token:**
   - Used only for counter selection
   - Marked with `temporary: true` in JWT
   - Should NOT be used for other API calls
   - Valid only until counter is selected

2. **Session Token:**
   - Created after counter selection
   - Contains user_id, counter_no, admin_id
   - Valid for 7 days
   - Used for all authenticated API calls

3. **Receptionist:**
   - No counter requirement
   - Session created immediately
   - Can access "/" page

4. **User:**
   - Counter required
   - Session created after counter selection
   - Can access "/user/dashboard"

---

## 🔍 Debugging

### Check Session Creation
```javascript
// In browser console after counter selection
const state = JSON.parse(sessionStorage.getItem('redux_auth_state'))
console.log('Token:', state.token)
console.log('User:', state.user)
console.log('Counter:', state.user.counter_no)
```

### Backend Logs
```bash
# Watch for these logs
✅ Session created for user X with counter Y
🎫 Temporary token generated for user login
🔒 User session check - no active session found
```

---

## ✅ Benefits

1. **Better Security:** Session only when counter assigned
2. **No Duplicate Sessions:** Counter check prevents conflicts
3. **Clear Flow:** User → Counter → Session → Dashboard
4. **Database Integrity:** counter_no always present in user sessions
5. **Role-based Logic:** Different flow for users vs receptionists

---

## 📞 Support

If issues persist:
1. Check backend logs for session creation
2. Verify temporary token in JWT
3. Confirm counter selection API call
4. Check database for active sessions
5. Clear browser cache/cookies

**Happy Coding! 🎉**
