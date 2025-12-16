# 🚀 Activity Logs - Quick Reference

## ⚡ Quick Start

```bash
# 1. Create Database Table
cd backend
node create-activity-logs-table.js

# 2. Start Server
npm start

# 3. Access Logs
Super Admin → License Management → Click Admin → Activity Logs
```

---

## 📊 Main Features

| Feature | Description |
|---------|-------------|
| 🎫 Ticket Tracking | Track all ticket activities |
| 👥 User Monitoring | Monitor user actions |
| 🔐 Login/Logout | Authentication logs |
| 🛠️ Service Changes | Service CRUD operations |
| ⚙️ Settings | Configuration changes |
| 📊 Statistics | Activity analytics |

---

## 🎯 Activity Types (Quick List)

```
✅ Tickets:
   - TICKET_CREATED
   - TICKET_CALLED
   - TICKET_COMPLETED
   - TICKET_TRANSFERRED

✅ Services:
   - SERVICE_CREATED
   - SERVICE_UPDATED
   - SERVICE_DELETED
   - SERVICE_ASSIGNED

✅ Users:
   - USER_CREATED
   - USER_UPDATED
   - USER_DELETED
   - ROLE_CHANGED

✅ Auth:
   - LOGIN
   - LOGOUT
   - PASSWORD_CHANGED

✅ System:
   - SETTINGS_CHANGED
   - COUNTER_ASSIGNED
   - SUPER_ADMIN_ACTION
```

---

## 🔍 Filters (Quick Access)

```javascript
// Activity Type
filterType: 'TICKET_CREATED' | 'LOGIN' | 'SERVICE_CREATED' | 'all'

// User Role
filterRole: 'admin' | 'user' | 'receptionist' | 'super_admin' | 'all'

// Date Range
startDate: '2024-01-01'
endDate: '2024-12-31'

// Search
search: 'ticket' | 'username' | 'service name'
```

---

## 🔧 API Quick Reference

```javascript
// Get Logs
GET /api/activity-logs/admin/:adminId?page=1&limit=50

// Get Stats
GET /api/activity-logs/admin/:adminId/stats

// Manual Log
POST /api/activity-logs/log
Body: {
  adminId, userId, userRole, activityType, description, metadata
}

// Cleanup
DELETE /api/activity-logs/admin/:adminId/cleanup?days=90
```

---

## 💻 Code Integration (Quick)

### Add Logging to Any Feature:

```javascript
import { logActivity } from '../../routes/activityLogs.js';

// In your controller
await logActivity(
  adminId,           // Admin ID
  userId,            // User ID
  'user',            // User role
  'TICKET_CREATED',  // Activity type
  'User created ticket A001', // Description
  { ticket_id: 'A001' },      // Metadata (optional)
  req                // Request object
);
```

---

## 📱 UI Components

### Import:
```javascript
import ActivityLogsPage from '@/app/[role]/activity-logs/page';
```

### Use:
```jsx
<ActivityLogsPage adminId={selectedAdmin?.admin_id} />
```

---

## 🎨 Color Codes (Quick)

```css
Blue    → TICKET_CREATED
Purple  → TICKET_CALLED
Green   → TICKET_COMPLETED / LOGIN
Red     → DELETED
Yellow  → UPDATED / SUPER_ADMIN
Orange  → USER_UPDATED
Gray    → SETTINGS / LOGOUT
```

---

## ✅ Currently Logged

| Feature | Controller | Status |
|---------|-----------|--------|
| Ticket Creation | createTicket | ✅ |
| Ticket Calling | callNextTicket | ✅ |
| Service Creation | createService | ✅ |
| Admin Login | adminLogin | ✅ |
| Logout | logout | ✅ |

---

## 🔜 Add More Logs

```javascript
// Template
await logActivity(
  adminId,
  userId,
  userRole,
  'ACTIVITY_TYPE',
  'Description of what happened',
  { key: 'value' },  // Additional data
  req
);
```

---

## 📊 Stats Dashboard Data

```javascript
stats = {
  activityCounts: [{ activity_type, count }],
  roleCounts: [{ user_role, count }],
  activeUsers: [{ id, username, activity_count }],
  recentActivities: [...]
}
```

---

## 🛡️ Security Checklist

- ✅ JWT token required
- ✅ Role-based access (super_admin only)
- ✅ IP address logging
- ✅ Device info tracking
- ✅ Auto cleanup old logs

---

## 🐛 Troubleshooting

```bash
# Check table exists
mysql> SHOW TABLES LIKE 'activity_logs';

# Check sample data
mysql> SELECT * FROM activity_logs LIMIT 5;

# Check API
curl http://localhost:5000/api/activity-logs/admin/1

# Check logs
Console → Network → activity-logs
```

---

## 📝 Database Quick Info

```sql
-- Table
activity_logs

-- Key Columns
id, admin_id, user_id, user_role, activity_type,
activity_description, metadata, created_at

-- Indexes
admin_id, user_id, activity_type, created_at
```

---

## ⚡ Performance Tips

1. Use pagination (limit 20-50)
2. Filter by date range
3. Use specific activity types
4. Regular cleanup (90+ days)
5. Index optimization

---

## 🎯 Common Queries

```javascript
// Last 24 hours
const yesterday = new Date(Date.now() - 24*60*60*1000);
filters.startDate = yesterday.toISOString().split('T')[0];

// Specific user
filters.search = 'username';

// Only logins
filters.activityType = 'LOGIN';

// Admin only
filters.userRole = 'admin';
```

---

## 📱 Responsive Breakpoints

```css
Mobile:  < 768px  (Stack cards)
Tablet:  768-1024px (2 columns)
Desktop: > 1024px (Full layout)
```

---

## 🚀 Next Steps

1. ✅ Add more activity types
2. ✅ Export logs (CSV/PDF)
3. ✅ Real-time notifications
4. ✅ Advanced analytics
5. ✅ Custom reports

---

## 💡 Pro Tips

- Use search for quick find
- Filter by date for reports
- Check stats for overview
- Export for auditing
- Regular cleanup for performance

---

**System Ready! Start Tracking!** 🎊
