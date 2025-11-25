# License Management System

## Overview
A comprehensive license management system for Super Admins to create, manage, and monitor licenses for admins.

## Features

### 1. Create License
- Generate unique license keys automatically
- Assign licenses to specific admins
- Configure license parameters:
  - License Type (Trial, Basic, Premium, Enterprise)
  - Start and Expiry dates
  - Max users and counters
  - Company information
  - Contact details

### 2. List of License
- View all licenses in a table format
- Search and filter functionality:
  - Search by license key, admin name, or company
  - Filter by license type
  - Filter by status
- Display license status with color-coded badges:
  - Active (Green)
  - Inactive (Gray)
  - Suspended (Orange)
  - Expired (Red)
  - Expiring Soon (Yellow)
- View days remaining until expiry
- Quick actions: View details, Delete license

### 3. License Report
- **Statistics Dashboard**:
  - Total licenses
  - Active licenses
  - Inactive licenses
  - Expired licenses
  - Licenses expiring soon

- **Visual Analytics**:
  - License distribution by type (Trial, Basic, Premium, Enterprise)
  - Progress bars showing percentage distribution

- **Expiring Soon Alert**:
  - List of licenses expiring within 30 days
  - Days remaining countdown

- **Recent Licenses**:
  - Table view of recently created licenses
  - Quick status overview

## Setup Instructions

### Backend Setup

1. **Create the database table**:
```bash
cd backend
node database/create-licenses-table.js
```

2. **Verify the routes are loaded** in `backend/server.js`:
```javascript
import licenseRoutes from './routes/license.js'
app.use('/api/license', licenseRoutes)
```

### Frontend Setup

1. **The Redux store is already configured** with license slice
2. **Sidebar is updated** with License Management section for Super Admin
3. **Three pages are created**:
   - `/[role]/license/create-license` - Create new licenses
   - `/[role]/license/list-of-license` - View and manage licenses
   - `/[role]/license/license-report` - View reports and analytics

## API Endpoints

### License Routes (Super Admin only)
- `POST /api/license/create` - Create new license
- `GET /api/license/all` - Get all licenses
- `GET /api/license/report` - Get license statistics and reports
- `GET /api/license/:id` - Get specific license by ID
- `PUT /api/license/:id` - Update license
- `DELETE /api/license/:id` - Delete license
- `GET /api/license/admins` - Get all admins for dropdown
- `GET /api/license/admin/:adminId` - Get specific admin info

## Database Schema

### Licenses Table
```sql
CREATE TABLE licenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  license_key VARCHAR(255) UNIQUE NOT NULL,
  admin_id INT NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  license_type ENUM('trial', 'basic', 'premium', 'enterprise') DEFAULT 'basic',
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  max_users INT DEFAULT 10,
  max_counters INT DEFAULT 5,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## Usage

### For Super Admin

1. **Login as Super Admin**
2. **Navigate to Sidebar** → License Management
3. **Create License**:
   - Click "Create License"
   - Generate or enter license key
   - Select admin from dropdown
   - Fill in company details
   - Set license type and dates
   - Configure user and counter limits
   - Submit

4. **View Licenses**:
   - Go to "List of License"
   - Use search and filters
   - View, edit, or delete licenses

5. **View Reports**:
   - Go to "License Report"
   - Check statistics and analytics
   - Monitor expiring licenses
   - View distribution by type

## Access Control
- Only **Super Admin** can access License Management
- Regular admins won't see this section in sidebar
- All API routes are protected with authentication and super admin authorization

## Status Indicators

| Status | Color | Description |
|--------|-------|-------------|
| Active | Green | License is currently active |
| Inactive | Gray | License is deactivated |
| Suspended | Orange | License is temporarily suspended |
| Expired | Red | License has expired |
| Expiring Soon | Yellow | License expires within 7 days |

## License Types

| Type | Description | Default Limits |
|------|-------------|----------------|
| Trial | Trial period license | 10 users, 5 counters |
| Basic | Basic features | 10 users, 5 counters |
| Premium | Advanced features | Custom limits |
| Enterprise | Full features | Custom limits |

## Future Enhancements
- Email notifications for expiring licenses
- License renewal workflow
- Usage analytics per license
- Automated license suspension on expiry
- Bulk license operations
- License history and audit logs
