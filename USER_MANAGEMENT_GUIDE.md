# User Management Guide - LE TATCHE BOIS

## 📧 Change Admin Email

### Option 1: Using the Script (Recommended)
Run this command to update the admin email:

```bash
npm run update:admin
```

It will prompt you to enter the new email address. The script will update the database automatically.

### Option 2: Manual Update via Prisma Studio
1. Run `npm run prisma:studio`
2. Navigate to the "User" model
3. Find the admin user (current email: `admin@letatchebois.com`)
4. Click on it and update the email field
5. Click "Save"

### Option 3: Direct Database Update
```bash
npx tsx scripts/update-admin-email.ts
```

---

## 👥 Creating New Users

### Current User Roles

Your system has 6 user roles with different access levels:

1. **ADMIN** - Full access to everything
   - All features and settings
   - Can manage users
   - Can change system settings

2. **MANAGER** - Can manage all except system settings
   - CRM, leads, clients, projects
   - Orders, invoices, quotes
   - Content management
   - Cannot access system settings or user management

3. **COMMERCIAL** - Sales focused
   - Leads, clients, quotes
   - Cannot access accounting or production

4. **CHEF_ATELIER** - Production focused
   - Projects, production tasks
   - Cannot access sales or accounting

5. **COMPTABLE** - Accounting focused
   - Invoices, payments, financial reports
   - Cannot access sales or production

6. **READONLY** - View only access
   - Can view all data but cannot edit

### Creating a New User (Via Admin Panel)

1. **Login** to the admin panel at: `https://letatchebois.com/admin/login`
   - Email: `admin@letatchebois.com` (or your updated email)
   - Password: `Admin@123!` (⚠️ Change this immediately!)

2. **Navigate** to: `Paramètres > Utilisateurs` (Settings > Users)

3. **Click** "Nouvel utilisateur" (New User)

4. **Fill in** the form:
   - **Nom complet**: Full name of the user
   - **Email**: Their email address (will be their login)
   - **Mot de passe**: Create a secure password
   - **Confirmer le mot de passe**: Repeat the password
   - **Rôle**: Choose from dropdown:
     - Administrateur (Full access)
     - Manager (All except settings)
     - Commercial (Sales)
     - Chef d'Atelier (Production)
     - Comptable (Accounting)
     - Readonly (View only)
   - **Statut**: Active/Inactive (toggle to allow/block login)
   - **Photo de profil** (Optional): Upload profile picture

5. **Click** "Enregistrer" (Save)

6. **Share** the credentials with the new user

### Managing Existing Users

1. Go to `Paramètres > Utilisateurs`
2. Click on any user to edit
3. You can:
   - Change their name
   - Update their email
   - Reset their password (leave blank to keep current)
   - Change their role
   - Activate/deactivate their account
   - Update their profile picture

---

## 🔐 Security Best Practices

1. **Change default password** immediately after first login
2. **Use strong passwords** (minimum 8 characters, mix of letters, numbers, symbols)
3. **Deactivate users** when they leave instead of deleting them (to preserve audit logs)
4. **Review user access** regularly
5. **Use least privilege** - give users only the access they need

---

## 🆘 Common Issues

### "Cannot login with new email"
- Clear browser cache and cookies
- Make sure the user is set to "Active"
- Verify the email was updated in the database

### "User cannot access certain features"
- Check their role assignment
- ADMIN role has full access
- Other roles have limited access based on their function

### "Forgot password"
Currently, password reset must be done manually:
1. Admin logs into the panel
2. Edit the user
3. Set a new password
4. Share it securely with the user

---

## 📝 Current Admin Credentials

**Default credentials** (from seed):
- Email: `admin@letatchebois.com`
- Password: `Admin@123!`

⚠️ **IMPORTANT**: Change these immediately in production!

---

## 🔄 User Roles Permission Matrix

| Feature | ADMIN | MANAGER | COMMERCIAL | CHEF_ATELIER | COMPTABLE | READONLY |
|---------|-------|---------|------------|--------------|-----------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRM Leads | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| CRM Clients | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Projects | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Products | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Orders | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Invoices | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Quotes | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Content | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

✅ = Full access | ❌ = No access

---

## 📞 Support

If you need help:
1. Check this guide first
2. Check the system logs in `Paramètres > Logs`
3. Contact your system administrator
