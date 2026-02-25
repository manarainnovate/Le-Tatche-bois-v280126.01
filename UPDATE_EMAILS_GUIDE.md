# Quick Guide: Update User Emails to Official Domains

## 🎯 Your Situation

You currently have development emails like:
- `ahmed@letatche-bois.ma` (not a real domain)
- `admin@letatchebois.com`
- `fatima@letatche-bois.ma`
- etc.

You want to change them to **official emails** like:
- Gmail: `aitouahman.abdelali@gmail.com`
- Or your official domain when ready

---

## ✅ Quick Solution

### **Step 1: Edit the Email Mapping**

Open the file: `scripts/update-all-users-emails.ts`

Find this section (around line 25):

```typescript
const emailMappings = {
  'admin@letatchebois.com': 'aitouahman.abdelali@gmail.com',
  'ahmed@letatche-bois.ma': 'aitouahman.abdelali@gmail.com',
  'fatima@letatche-bois.ma': '', // Leave empty to skip
  'mohammed@letatche-bois.ma': '', // Leave empty to skip
  'karim@letatche-bois.ma': '', // Leave empty to skip
};
```

**Change it to YOUR emails:**

```typescript
const emailMappings = {
  'admin@letatchebois.com': 'your-new-email@gmail.com',
  'ahmed@letatche-bois.ma': 'your-new-email@gmail.com',
  'fatima@letatche-bois.ma': 'fatima.real@gmail.com', // Or leave '' to skip
  'mohammed@letatche-bois.ma': '', // Empty = skip this user
  'karim@letatche-bois.ma': '', // Empty = skip this user
};
```

### **Step 2: Run the Update Script**

```bash
npm run update:emails
```

The script will:
1. Show you all current users
2. Show you what emails will change
3. Ask for confirmation
4. Update the database

### **Step 3: Login with New Email**

After the update:
- Old login: `ahmed@letatche-bois.ma`
- New login: `your-new-email@gmail.com`
- Password: Same as before (or `Admin@123!` if it's the admin)

---

## 📧 Email Requirements

The system **NOW ACCEPTS ANY EMAIL**:
- ✅ Gmail: `yourname@gmail.com`
- ✅ Outlook: `yourname@outlook.com`
- ✅ Yahoo: `yourname@yahoo.com`
- ✅ Custom domain: `yourname@yourdomain.com`
- ✅ ANY valid email address

You can create users with ANY email domain when you add them via the admin panel!

---

## 🔄 Update Individual User Email (Via Admin Panel)

If you just want to change ONE user's email:

1. Login to admin: `https://letatchebois.com/fr/admin/login`
2. Go to: `Paramètres > Utilisateurs`
3. Click on the user you want to edit
4. Change the **Email** field to the new email
5. Click **Enregistrer** (Save)

Done! They can now login with the new email.

---

## 🆕 Add New User with Gmail (or any email)

When creating a new user:

1. Go to `Paramètres > Utilisateurs`
2. Click `Nouvel utilisateur`
3. Fill in:
   - **Email**: `john.doe@gmail.com` (or ANY email)
   - **Password**: Create one
   - **Role**: Choose role
4. Click **Enregistrer**

The system accepts **any email domain** - no restrictions!

---

## 🔍 Check Current Users

To see all users in your database:

```bash
npm run prisma:studio
```

Then:
1. Click on **User** table
2. You'll see all users with their emails
3. You can edit directly here too

---

## ⚠️ Important Notes

1. **Email must be unique** - Can't use the same email for 2 users
2. **Update one at a time** - If script fails, update manually via admin panel
3. **Keep a backup** - Note down old emails before updating
4. **Test login** - After changing email, test that you can login with new email

---

## 🚀 Recommended Approach

**For YOUR main admin account:**

```bash
# Option 1: Use the single-user update script
npm run update:admin
# Enter: aitouahman.abdelali@gmail.com

# Option 2: Use the admin panel
1. Login with: admin@letatchebois.com
2. Go to Paramètres > Utilisateurs
3. Click on your user
4. Change email to: aitouahman.abdelali@gmail.com
5. Save
```

**For other users:**
- If they don't exist yet: Leave them as-is or delete them
- If you need them: Update via admin panel when ready

---

## 📞 Need Help?

If you get errors:
1. Check the email isn't already in use
2. Make sure the old email exists in database
3. Try updating via Prisma Studio or admin panel instead
4. Contact support if stuck

---

## 💡 Pro Tip

You can use the **same Gmail** for multiple test users by using Gmail's `+` trick:
- `your.email+admin@gmail.com`
- `your.email+test1@gmail.com`
- `your.email+test2@gmail.com`

All go to `your.email@gmail.com` but count as different emails in the system!
