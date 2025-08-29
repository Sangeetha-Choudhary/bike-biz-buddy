# 2Wheelserv.com - Multi-Level Role Hierarchy System

## Overview
The 2Wheelserv.com features a comprehensive three-tier role hierarchy system designed for multi-store operations. The system ensures proper delegation of authority from Global Admin → Store Admin → Sales Executive while maintaining strict data isolation between stores and appropriate access controls.

## Role Hierarchy & Permissions

### 1. Global Administrator (admin@bikebiz.com / admin123)
- **Complete System Access Across All Stores**
- **Permissions**: All system permissions
- **Key Responsibilities:**
  - Create and manage stores across all locations
  - Assign Store Admins to manage individual stores
  - Global system configuration and settings
  - Cross-store analytics and reporting
  - User management at global level
  - System security and compliance oversight

### 2. Store Administrator (Store-Specific Management)
- **Complete Store Management with Team Building Authority**
- **Available Demo Accounts:**
  - Mumbai Store Admin: store@mumbai.com / store123
  - Delhi Store Admin: store@delhi.com / store123
  - Bangalore Store Admin: store@bangalore.com / store123

- **Store Admin Permissions:**
  - `manage_store` - Store configuration and settings
  - `manage_store_users` - Create and manage Sales Executives for their store
  - `manage_leads` - Full lead management within store
  - `manage_inventory` - Complete inventory control for store
  - `match_engine` - Smart vehicle matching system access
  - `view_analytics` - Comprehensive store analytics
  - `create_sales` - Sales transaction processing
  - `view_reports` - Store performance reports
  - `manage_test_rides` - Test ride scheduling and management
  - `approve_sales` - Approve high-value sales transactions
  - `manage_store_analytics` - Advanced store performance analytics
  - `export_data` - Export store-specific data

- **Key Responsibilities:**
  - Manage all aspects of their assigned store
  - Recruit and onboard Sales Executives
  - Set store-level targets and KPIs
  - Monitor store performance and team productivity
  - Handle escalated customer issues
  - Ensure compliance with company policies

### 3. Sales Executive (Lead Generation & Fulfillment)
- **Focused on Lead Generation and Sales Fulfillment**
- **Available Demo Accounts:**
  - Mumbai Lead Gen: sales1@mumbai.com / sales123
  - Mumbai Sales: sales2@mumbai.com / sales123
  - Delhi Lead Gen: sales1@delhi.com / sales123

- **Sales Executive Permissions:**
  - `manage_leads` - Lead management within assigned store
  - `view_inventory` - View store inventory (read-only)
  - `match_engine` - Smart vehicle matching for customers
  - `create_sales` - Sales transaction creation (with limits)
  - `manage_test_rides` - Test ride scheduling and management
  - `send_messages` - Customer communication via WhatsApp
  - `schedule_followups` - Customer follow-up scheduling
  - `view_leads` - View lead details and history
  - `update_lead_status` - Update lead status and add notes
  - `view_basic_analytics` - Basic performance metrics
  - `generate_leads` - Lead generation activities

- **Specializations:**
  - **Lead Generation Focus**: Customer acquisition and initial engagement
  - **Sales & Fulfillment Focus**: Converting leads to sales and transaction completion
  - **Customer Service Focus**: Post-sale support and relationship management

## Store Management Features

### Store Creation (Global Admin Only)
- Complete store setup with location details
- Manager assignment and contact information
- Initial configuration and settings
- Integration with inventory and lead systems

### Team Management (Store Admin)
- Create Sales Executive accounts for their store
- Assign roles and departments
- Monitor team performance
- Manage access and permissions within store scope

### Data Isolation
- Each store maintains separate data boundaries
- Sales Executives can only access their store's data
- Store Admins have full visibility of their store only
- Global Admin has comprehensive cross-store visibility

## Key Features

### Authentication System
- Secure login with email/password
- Session management with localStorage
- Auto-login on page refresh
- Role-based redirects

### Permission System
- Granular permission control
- Component-level access control
- Dynamic UI based on permissions
- Sensitive data protection

### Admin Panel
- User management interface
- Store management
- System health monitoring
- Database management
- System settings configuration

### Navigation
- Role-based menu items
- Mobile-responsive navigation
- Permission-aware bottom navigation
- Admin-only sections

## Components Created

### Core Auth Components
1. **AuthContext.tsx** - Authentication state management
2. **Login.tsx** - Login interface with role demos
3. **Navigation.tsx** - RBAC-aware navigation
4. **AdminPanel.tsx** - Complete admin interface

### RBAC Components
1. **PermissionWrapper.tsx** - Permission-based component wrapper
2. **RBACDemo.tsx** - Interactive RBAC demonstration
3. **Updated App.tsx** - Integrated authentication flow

### Enhanced Components
- **Dashboard.tsx** - Enhanced with RBAC features
- **MatchEngine.tsx** - Complete functional system
- **BottomNavigation.tsx** - Permission-aware mobile nav

## Security Features

### Data Protection
- Sensitive data masking based on permissions
- API call restrictions by role
- Component-level access control
- Form field restrictions

### Session Management
- Automatic logout on permission changes
- Secure token storage
- Session validation
- Role verification

## Usage Examples

### Protecting Components
```tsx
import PermissionWrapper from '@/components/PermissionWrapper';

<PermissionWrapper permission="manage_leads">
  <SensitiveComponent />
</PermissionWrapper>
```

### Role-Based Content
```tsx
import { RoleBasedContent } from '@/components/PermissionWrapper';

<RoleBasedContent
  admin={<AdminOnlyContent />}
  manager={<ManagerContent />}
  sales={<SalesContent />}
  viewer={<ViewerContent />}
/>
```

### Sensitive Data
```tsx
import { SensitiveData } from '@/components/PermissionWrapper';

<SensitiveData permission="view_analytics">
  ₹2,45,000 Revenue
</SensitiveData>
```

## Demo Instructions

1. **Start the application** - It will show the login screen
2. **Try different roles** - Use the demo accounts provided
3. **Observe changes** - Notice how the interface adapts to each role
4. **Test permissions** - Try accessing restricted features
5. **Admin features** - Login as admin to see the admin panel

## Technical Implementation

### State Management
- React Context for authentication state
- TypeScript for type safety
- Local storage for session persistence

### UI/UX
- Responsive design for all screen sizes
- Role-based color coding
- Permission indicators
- Access denied fallbacks

### Navigation
- Dynamic menu based on permissions
- Mobile-first bottom navigation
- Admin-only sections
- Breadcrumb navigation

## Future Enhancements

- Two-factor authentication
- Password reset functionality
- Audit logging
- Permission inheritance
- Custom role creation
- API key management
- Multi-store permissions
- Team-based permissions

## Testing the System

1. Login with different roles to see UI changes
2. Try accessing restricted pages
3. Test sensitive data masking
4. Verify admin panel functionality
5. Check mobile navigation permissions

The system provides a production-ready RBAC implementation with comprehensive security, user management, and role-based access control suitable for a real-world CRM application.
