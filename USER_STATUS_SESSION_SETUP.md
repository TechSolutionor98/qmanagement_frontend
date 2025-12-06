# User Status & Session Management Setup

## ✅ Implemented Features

### 1. **User Status Management**
- Users table me `status` column add kiya gaya hai
- Status types:
  - ✅ `active` - User login kar sakta hai (default)
  - ❌ `inactive` - User login nahi kar sakta
  - 🚫 `suspended` - User account suspended

### 2. **Session Duration - 7 Days**
- Har user aur admin ka session **7 days** tak valid rahega
- JWT token expiry: `7d`
- Database me bhi `expires_at` 7 days ke saath store hota hai

---

## 📋 Database Migration

### Step 1: Run Migration Script

```bash
# Backend folder me jao
cd backend

# Migration script run karo
node database/add-user-status-column.js
```

Migration ye changes karega:
- ✅ `status` column add karega users table me
- ✅ `created_at` aur `updated_at` columns add karega (agar nahi hain)
- ✅ Index add karega status column par
- ✅ Existing users ko 'active' status assign karega

### Alternative: SQL Script Use Karo

```bash
# PhpMyAdmin ya MySQL client me ye query run karo:
source backend/database/add-user-status-column.sql
```

---

## 🔒 Login Rules

### Active Users
```
Status: active
✅ Login allowed
✅ Session: 7 days
```

### Inactive Users
```
Status: inactive
❌ Login blocked
Error: "Your account is inactive. Please contact your administrator."
```

### Suspended Users
```
Status: suspended
❌ Login blocked
Error: "Your account has been suspended. Please contact your administrator."
```

---

## 🧪 Testing

### Test 1: Active User Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Response: ✅ Success
{
  "success": true,
  "token": "jwt_token_here...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user1",
    "role": "user"
  }
}
```

### Test 2: Inactive User Login
```sql
-- User ko inactive karo
UPDATE users SET status = 'inactive' WHERE id = 1;
```

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Response: ❌ Blocked
{
  "success": false,
  "message": "Your account is inactive. Please contact your administrator.",
  "account_status": "inactive"
}
```

### Test 3: Session Expiry Check
```javascript
// Session 7 days baad automatically expire ho jayega
// Database me expires_at check hota hai
// JWT token bhi 7d ke baad invalid ho jayega
```

---

## 📊 Database Schema Changes

### Before
```sql
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(250) NOT NULL
)
```

### After
```sql
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(250) NOT NULL,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_status` (`status`)
)
```

---

## 🎯 Admin Control

### User Status Change Karne Ke Liye

```sql
-- User ko inactive karo
UPDATE users SET status = 'inactive' WHERE id = 1;

-- User ko active karo
UPDATE users SET status = 'active' WHERE id = 1;

-- User ko suspend karo
UPDATE users SET status = 'suspended' WHERE id = 1;
```

### All Inactive Users Dekhne Ke Liye
```sql
SELECT id, username, email, status, created_at 
FROM users 
WHERE status = 'inactive';
```

### All Active Sessions Dekhne Ke Liye
```sql
SELECT 
  us.session_id,
  u.username,
  u.email,
  u.status,
  us.login_time,
  us.expires_at,
  DATEDIFF(us.expires_at, NOW()) as days_remaining
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.active = 1 
AND us.expires_at > NOW()
ORDER BY us.login_time DESC;
```

---

## ✅ Files Updated

1. **Backend/database/add-user-status-column.sql** - SQL migration script
2. **Backend/database/add-user-status-column.js** - JavaScript migration script
3. **Backend/controllers/auth/userLogin.js** - Login me status check add kiya

## ✅ Existing Features (Already Working)

1. **Session Duration**: 7 days ✅
   - `backend/config/auth.js` - `expiresIn: '7d'`
   - `backend/controllers/auth/sessionManager.js` - Both user aur admin sessions

2. **Session Validation**: ✅
   - Active session check
   - Expired session auto-cleanup
   - JWT verification

---

## 🚀 Deployment Steps

1. Database migration run karo
2. Backend restart karo
3. Test inactive user login
4. Verify session expiry (7 days)

---

## 📞 Support

Agar koi issue ho to:
1. Database migration check karo
2. Backend logs check karo
3. Session expiry time verify karo (7 days hona chahiye)

**Happy Coding! 🎉**
