# Production Announcement Fix - Complete Guide

## 🐛 Problem Identified

User reported: "live per user ticket call kerta hn to screen ma anoucement nai hoo rehi"

### Root Causes Found:

1. **❌ BroadcastChannel Limitation**
   - BroadcastChannel only works on same device/browser (same-origin)
   - Dashboard (device 1) ➡️ Display screen (device 2) = **CANNOT COMMUNICATE**
   - Solution: Rely on backend polling (already implemented)

2. **❌ Polling useEffect Dependencies**
   - Had `[isAnnouncing, lastAnnouncedTime]` dependencies
   - Caused polling to **restart** on every state change
   - Disrupted the continuous polling flow

3. **❌ No Production Debugging**
   - Console logs not visible on production display screens
   - No way to see if announcements were starting/failing

## ✅ Fixes Applied

### 1. Fixed Polling Dependencies
**Before:**
```javascript
}, [isAnnouncing, lastAnnouncedTime]); // Restarts polling on every change
```

**After:**
```javascript
}, []); // Runs once and polls continuously
```

### 2. Added Visual Production Debugging
- Browser **title changes** to show announcement status
- Visible on display screen tab title
- Shows errors for 5 seconds

**Features:**
- `🔊 Announcing B-123` - announcement started
- `❌ Error: TTS service offline` - error occurred
- `Ticket Info Display` - normal state

### 3. Added Error Alerts
- Voice service offline? Shows alert immediately
- Helps identify configuration issues on production

### 4. Removed unsafe Accept-Encoding header
- Fixed console warning: "Refused to set unsafe header"
- Browser handles compression automatically

## 🔍 How to Debug on Production

### Check 1: Is Display Screen Getting Tickets?
1. Open display screen in browser
2. Press `F12` → Console tab
3. Look for logs every 2 seconds:
   ```
   🔃 Polling backend for new tickets...
   📥 Backend tickets response: {...}
   ```
4. Should see: `✅ FILTERED tickets (status=called + valid counter)`

### Check 2: Is Voice Service Ready?
1. In console, look for:
   ```
   ✅ ChatterBox AI Voice service is ready
   ```
2. If missing, Python TTS service is offline

### Check 3: Is Announcement Triggering?
1. **Watch the browser tab title** on display screen
2. When ticket is called, title should change to: `🔊 Announcing B-123`
3. If title doesn't change = announcement not triggered
4. If shows error = voice service issue

### Check 4: Network Issues
1. F12 → Network tab
2. Filter: `called-tickets`
3. Should see request every 2 seconds
4. Check response status (should be 200)

## 🎯 Expected Flow (Production)

```
┌─────────────────────┐
│   Dashboard User    │
│   Clicks "Call"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│   Backend Database              │
│   Updates ticket status         │
│   status = 'called'             │
│   called_at = NOW()             │
└──────────┬──────────────────────┘
           │
           │ (2 second polling)
           ▼
┌─────────────────────────────────┐
│   Display Screen                │
│   Fetches /called-tickets       │
│   Detects new timestamp         │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│   Announcement Triggered        │
│   Title: 🔊 Announcing...       │
│   Plays voice in all languages  │
└─────────────────────────────────┘
```

## 📝 Important Notes

### Backend Must Be Configured Correctly
Display screen reads from: `GET /api/user/called-tickets`

**Required:**
- Endpoint must return tickets sorted by `called_at DESC`
- Only tickets with `status='called'` should be included
- Must have valid `counter_no` (not NULL)

### Voice Service Requirements
- Python TTS service must be running
- Backend must have route: `GET /api/voices/health`
- Should return: `{status: 'ok', python_service: 'online'}`

### Authentication
- Display screen must be logged in as `ticket_info` role
- Token must be valid and not expired
- Check: `localStorage.getItem('token')`

## 🚀 Deployment Steps

1. **Build frontend:**
   ```bash
   yarn build
   ```

2. **Push to production:**
   ```bash
   git add .
   git commit -m "fix: production announcement polling and debugging"
   git push
   ```

3. **Deploy to Vercel/hosting:**
   - Vercel will auto-deploy from GitHub
   - Wait for build to complete

4. **Test on production:**
   - Open display screen
   - Watch browser tab title
   - Call a ticket from dashboard
   - Should see: `🔊 Announcing [ticket]`

## 🔧 Troubleshooting

### Problem: Title doesn't change when ticket called
**Cause:** Polling not detecting new ticket
**Check:**
1. Console: Is polling running? (should see logs every 2s)
2. Network: Is API responding? (check /called-tickets)
3. Backend: Is ticket status actually 'called'?

### Problem: Title shows error
**Cause:** Voice service offline
**Fix:**
1. Check Python TTS service is running
2. Check backend route: `/api/voices/health`
3. Restart Python service if needed

### Problem: No logs in console
**Cause:** Console filtering or page not loaded
**Fix:**
1. Clear console filters
2. Refresh display screen page
3. Ensure logged in as ticket_info role

## ✅ Files Modified

1. `src/utils/axiosInstance.js` - Removed unsafe Accept-Encoding header
2. `src/app/ticket_info_vertical/page.js` - Fixed polling, added debugging
3. `src/app/ticket_info_horizontal/page.js` - Fixed polling, added debugging

## 📞 Support

If announcements still don't work after these fixes:

1. **Check backend logs** - is /called-tickets being hit?
2. **Check Python service** - is it running and accessible?
3. **Check browser console** - any errors showing?
4. **Check network tab** - are requests succeeding?
5. **Watch tab title** - does it change to show announcement?

---

**Date Fixed:** December 23, 2025
**Status:** ✅ Ready for Production Testing
