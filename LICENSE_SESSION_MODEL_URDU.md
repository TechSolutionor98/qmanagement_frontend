# 🎯 License Session Model - Quick Setup (Urdu)

## 📋 کیا تبدیل ہوا؟

### پرانا Model ❌
- الگ الگ **Receptionists** users
- الگ الگ **Ticket Info** users  
- ہر user کے لیے sessions limit

### نیا Model ✅
- **ایک Default User** دونوں roles کے لیے
- **Sessions Based System**
- آسان management

---

## 🔧 Step 1: Database Migration چلائیں

```bash
cd backend
node database/add-both-user-field.js
```

**Output:**
```
🔧 Adding both_user field to licenses table...
✅ Added both_user field to licenses table
✅ Updated X existing licenses
✅ Verification successful!
🎉 Migration completed successfully!
```

---

## 📊 نیا Database Schema

```sql
licenses table:
  - max_receptionist_sessions (کل receptionist sessions)
  - max_ticket_info_sessions (کل ticket info sessions)
  - both_user (default: 1) ← نیا field
```

---

## 🎨 Frontend Changes

### Create License Form:
- ✅ Max Receptionist Sessions (1-10)
- ✅ Max Ticket Info Sessions (1-10)
- ✅ both_user = 1 (auto-set)

### Success Message:
```
✅ License created successfully!

👤 Admin Login:
   Email: admin@company.com
   Password: ******

👥 Default User Created:
   Email: adminuser@company.com
   Password: QueUser123!
   Roles: receptionist, ticket_info
   Note: Can login to both screens

📊 Session Limits:
   Receptionist Sessions: 2
   Ticket Info Sessions: 3
```

---

## 🚀 Backend Changes

### License Create API:
1. ✅ Admin account بنتا ہے
2. ✅ License record بنتا ہے
3. ✅ **Default user automatically بنتا ہے**
   - Role: `receptionist,ticket_info` (comma separated)
   - Email: `{admin}.user@{company}.com`
   - Password: `QueUser123!`

---

## 💡 کیسے کام کرتا ہے؟

### Example License:
```json
{
  "max_receptionist_sessions": 2,
  "max_ticket_info_sessions": 3,
  "both_user": 1
}
```

### Default User:
- **Email:** `admin.user@company.com`
- **Password:** `QueUser123!`
- **Roles:** `receptionist,ticket_info`

### Sessions:
- یہ user **2 devices** پر receptionist screen کھول سکتا ہے
- یہ user **3 displays** پر ticket info screen کھول سکتا ہے

---

## ✅ Testing Steps

### 1. Create New License
```bash
# Frontend se license create karo:
- Company Name: Test Company
- Admin Email: admin@test.com
- Max Receptionist Sessions: 2
- Max Ticket Info Sessions: 3
```

### 2. Check Database
```sql
-- License check karo
SELECT * FROM licenses WHERE company_name = 'Test Company';

-- Default user check karo
SELECT * FROM users WHERE email LIKE '%test.com%';

-- User ka role check karo
SELECT username, email, role FROM users WHERE role LIKE '%receptionist%';
```

### 3. Test Login
```
1. Receptionist Screen:
   - Email: admin.user@testcompany.com
   - Password: QueUser123!
   - ✅ Should login successfully

2. Ticket Info Screen:
   - Same credentials
   - ✅ Should login successfully

3. Multiple Sessions:
   - Open 2 receptionist screens
   - Open 3 ticket info displays
   - ✅ All should work
   - ❌ 3rd receptionist = Error
   - ❌ 4th ticket info = Error
```

---

## 🔐 Security Notes

### Default Password:
- **Password:** `QueUser123!`
- ⚠️ Admin کو یہ password change کرنا چاہیے
- Future: Password change feature add کریں

### Email Format:
- `{adminname}.user@{companyname}.com`
- Spaces remove ہو جاتی ہیں
- Lowercase convert ہوتا ہے

---

## 📝 Important Files Modified

### Backend:
- ✅ `backend/controllers/license/createLicense.js`
- ✅ `backend/database/add-both-user-field.js` (NEW)

### Frontend:
- ✅ `src/app/[role]/license/create-license/page.js`

### Database:
- ✅ `licenses` table updated
- ✅ `users` table (default user creates)

---

## 🎯 Next Steps

### 1. Session Validation:
- Login time پر session count check کرنا
- Max limit exceed ہو تو error دینا

### 2. Session Management:
- Admin dashboard میں active sessions دکھانا
- Session terminate کرنے کی option

### 3. User Management:
- Default user ka password reset
- Additional users create کرنا (اگر license allows)

---

## 🆘 Troubleshooting

### Problem: Default user nahi bana
**Solution:**
```sql
-- Check license table
SELECT both_user FROM licenses WHERE id = 1;

-- Manually create user
INSERT INTO users (username, email, password, role, admin_id, status)
VALUES ('Admin User', 'admin.user@company.com', 
        '$2a$10$hashedpassword', 'receptionist,ticket_info', 1, 'active');
```

### Problem: Sessions limit kaam nahi kar raha
**Solution:**
```sql
-- Check license limits
SELECT max_receptionist_sessions, max_ticket_info_sessions 
FROM licenses WHERE admin_id = 1;

-- Check active sessions
SELECT * FROM user_sessions WHERE user_id = 1 AND is_active = 1;
```

### Problem: User login nahi ho raha
**Solution:**
```sql
-- Check user exists
SELECT * FROM users WHERE email = 'admin.user@company.com';

-- Check role format
SELECT role FROM users WHERE id = 1;
-- Should be: receptionist,ticket_info (comma separated)
```

---

## 📞 Support

اگر کوئی مسئلہ ہو تو:
1. Database migration پھر سے چلائیں
2. License table check کریں
3. Users table check کریں
4. Backend logs دیکھیں

---

## ✅ Checklist

- [ ] Database migration چلایا
- [ ] Frontend updated
- [ ] Backend updated  
- [ ] Test license created
- [ ] Default user created
- [ ] Both roles working
- [ ] Sessions limiting working

---

**🎉 Setup Complete! اب آپ کا نیا session-based model تیار ہے!**
