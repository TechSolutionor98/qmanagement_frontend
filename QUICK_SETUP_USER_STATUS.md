# 🚀 Quick Setup Guide - User Status & Session Management

## Step 1: Database Migration (ZARURI!)

```bash
cd backend
node database/add-user-status-column.js
```

**Output:**
```
✅ Status column added successfully
✅ Index added for status column
✅ Updated X users to active status
🎉 Migration completed successfully
```

---

## Step 2: Test Setup

```bash
node backend/test-user-status-session.js
```

**Expected Output:**
```
✅ Database Structure: READY
📊 Total Users: X
   - Active: X ✅
   - Inactive: 0
   - Suspended: 0
🔐 Active Sessions: X
⏰ Session Duration: 7 days
```

---

## Step 3: Restart Backend

```bash
cd backend
npm start
# or
node server.js
```

---

## ✅ What's Working Now

### 1. **Inactive Users Cannot Login** ❌
```sql
-- Kisi user ko inactive karne ke liye:
UPDATE users SET status = 'inactive' WHERE email = 'user@example.com';
```

**Login Response:**
```json
{
  "success": false,
  "message": "Your account is inactive. Please contact your administrator.",
  "account_status": "inactive"
}
```

### 2. **Active Users Can Login** ✅
```sql
-- User ko wapas active karne ke liye:
UPDATE users SET status = 'active' WHERE email = 'user@example.com';
```

### 3. **Session Expires in 7 Days** ⏰
- Login ke baad 7 din tak session valid rahega
- 7 din baad automatically expire ho jayega
- Dobara login karna padega

---

## 🎯 User Status Types

| Status | Login | Description |
|--------|-------|-------------|
| `active` | ✅ Allowed | Normal user, login kar sakta hai |
| `inactive` | ❌ Blocked | Account inactive, login nahi kar sakta |
| `suspended` | 🚫 Blocked | Account suspended, admin ne block kiya |

---

## 📋 Common Commands

### Check All Users Status
```sql
SELECT id, username, email, status 
FROM users 
ORDER BY status, id;
```

### Activate User
```sql
UPDATE users SET status = 'active' WHERE id = 1;
```

### Deactivate User
```sql
UPDATE users SET status = 'inactive' WHERE id = 1;
```

### Suspend User
```sql
UPDATE users SET status = 'suspended' WHERE id = 1;
```

### Check Active Sessions
```sql
SELECT 
  u.username,
  u.email,
  u.status,
  us.login_time,
  us.expires_at,
  DATEDIFF(us.expires_at, NOW()) as days_remaining
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.active = 1 AND us.expires_at > NOW();
```

---

## 🧪 Test Scenarios

### Test 1: Active User Login ✅
1. User status: `active`
2. Login karein
3. ✅ Success - Token milega

### Test 2: Inactive User Login ❌
1. Run: `UPDATE users SET status = 'inactive' WHERE id = 1;`
2. Login karein
3. ❌ Blocked - Error message milega

### Test 3: Session Expiry (7 days) ⏰
1. Login karein
2. Token save karein
3. 7 days wait karein (ya database me expires_at manually change karein)
4. ❌ Token invalid ho jayega

---

## 🔧 Troubleshooting

### Problem: Status column nahi hai
**Solution:**
```bash
node backend/database/add-user-status-column.js
```

### Problem: All users inactive ho gaye
**Solution:**
```sql
UPDATE users SET status = 'active';
```

### Problem: Session immediately expire ho raha hai
**Check:**
1. `backend/config/auth.js` - expiresIn: '7d' hai?
2. `backend/controllers/auth/sessionManager.js` - expires_at sahi calculate ho raha hai?

---

## 📁 Updated Files

✅ `backend/database/add-user-status-column.js` - Migration script
✅ `backend/database/add-user-status-column.sql` - SQL migration
✅ `backend/controllers/auth/userLogin.js` - Status check added
✅ `backend/test-user-status-session.js` - Test script
✅ `USER_STATUS_SESSION_SETUP.md` - Complete documentation

---

## ✅ Checklist

- [ ] Migration run kiya?
- [ ] Test script chalaya?
- [ ] Backend restart kiya?
- [ ] Inactive user test kiya?
- [ ] Session expiry test kiya?

**Sab ✅ ho to aap ready hain! 🎉**
