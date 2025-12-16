# ⚡ Timezone Quick Reference Card

## 🎯 Quick Start

### Import the Utility
```javascript
import { formatToLocalTime, formatActivityLogDate } from '@/utils/timezone';
```

### Basic Usage
```javascript
// Simple conversion
formatToLocalTime(ticket.created_at)
// → "Dec 15, 2025, 14:30:45"

// Activity log format (smart)
formatActivityLogDate(log.created_at)
// → "5 minutes ago" or full date
```

---

## 📚 All Functions

| Function | Use Case | Example Output |
|----------|----------|----------------|
| `formatToLocalTime(date)` | General timestamps | `Dec 15, 2025, 14:30:45` |
| `formatDateOnly(date)` | Date without time | `Dec 15, 2025` |
| `formatTimeOnly(date)` | Time without date | `14:30:45` |
| `formatShortDate(date)` | Compact format | `Dec 15, 2025, 14:30` |
| `formatActivityLogDate(date)` | Activity logs | `5 minutes ago` |
| `getRelativeTime(date)` | Pure relative | `2 hours ago` |
| `getUserTimezone()` | Get timezone name | `Asia/Dubai` |
| `getTimezoneOffset()` | Get UTC offset | `+04:00` |
| `formatForExport(date)` | Excel/CSV export | `12/15/2025, 14:30:45` |

---

## 🎨 Common Patterns

### Pattern 1: Activity Logs
```javascript
<span>{formatActivityLogDate(log.created_at)}</span>
```

### Pattern 2: Tickets Table
```javascript
<td>{formatToLocalTime(ticket.created_at)}</td>
```

### Pattern 3: Report Export
```javascript
const exportTime = formatForExport(data.timestamp);
```

### Pattern 4: Show Timezone Info
```javascript
<div>
  <p>Timezone: {getUserTimezone()}</p>
  <p>UTC {getTimezoneOffset()}</p>
</div>
```

---

## ✅ Updated Files

- ✅ `src/utils/timezone.js` - Main utility
- ✅ `src/app/[role]/activity-logs/page.js` - Activity logs
- ✅ `src/app/[role]/page.js` - Main tickets
- ✅ `src/app/[role]/reports/details-reports/page.js` - Reports
- ✅ `src/app/[role]/license/license-report/page.js` - License

---

## 🧪 Testing

### Open Test Page
```
Open: TIMEZONE_TEST.html in browser
```

### Check in Console
```javascript
Intl.DateTimeFormat().resolvedOptions().timeZone
// Should show your timezone
```

### Verify in App
1. Open Activity Logs
2. Check header for timezone info
3. Verify timestamps match your local time

---

## 🌍 Examples by Region

| Region | UTC Offset | Sample Time (for UTC 10:30) |
|--------|-----------|----------------------------|
| 🇦🇪 Dubai | +04:00 | 14:30 (2:30 PM) |
| 🇵🇰 Karachi | +05:00 | 15:30 (3:30 PM) |
| 🇬🇧 London | +00:00 | 10:30 (10:30 AM) |
| 🇺🇸 New York | -05:00 | 05:30 (5:30 AM) |

---

## 🔧 Developer Tips

### Do ✅
```javascript
// Use utility function
formatToLocalTime(ticket.created_at)

// Store UTC in backend
created_at: new Date().toISOString()

// Convert in frontend only
{formatToLocalTime(data.timestamp)}
```

### Don't ❌
```javascript
// Don't use raw date
{ticket.created_at}

// Don't use toLocaleString directly
{new Date(ticket.created_at).toLocaleString()}

// Don't convert on backend
// Let MySQL store UTC, convert in frontend
```

---

## 📝 Code Snippets

### Add Timezone Info to Header
```javascript
import { getUserTimezone, getTimezoneOffset } from '@/utils/timezone';

<div className="text-right text-sm text-gray-500">
  <p>🌍 Timezone: {getUserTimezone()}</p>
  <p>⏰ UTC {getTimezoneOffset()}</p>
</div>
```

### Format in Table
```javascript
import { formatToLocalTime } from '@/utils/timezone';

<td>{formatToLocalTime(row.created_at)}</td>
```

### Activity Log Display
```javascript
import { formatActivityLogDate } from '@/utils/timezone';

<span className="text-xs text-gray-500">
  {formatActivityLogDate(log.created_at)}
</span>
```

---

## 🆘 Troubleshooting

### Issue: Wrong timezone
```
1. Check system timezone
2. Restart browser
3. Clear cache
4. Verify: Intl.DateTimeFormat().resolvedOptions().timeZone
```

### Issue: "Invalid Date"
```
1. Check backend returns ISO string
2. Verify format: YYYY-MM-DDTHH:mm:ss.sssZ
3. Ensure value is not null
```

---

## 📖 Documentation

- Full Guide: `TIMEZONE_IMPLEMENTATION_GUIDE.md`
- Urdu Guide: `TIMEZONE_URDU_COMPLETE_GUIDE.md`
- Test Page: `TIMEZONE_TEST.html`
- Utility Code: `src/utils/timezone.js`

---

## 🎊 Summary

**What:** Global timezone support  
**Where:** All timestamps in app  
**How:** Automatic browser detection  
**Who:** All users worldwide  
**When:** Production ready now  

**Status: ✅ COMPLETE**

---

**Created: December 15, 2025**  
**Version: 1.0**
