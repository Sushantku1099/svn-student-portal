# SVN Infra & Solar Service Pvt Ltd - Student Registration Portal

A production-ready full-stack **Student Registration Portal with Admin Dashboard** for **SVN Infra & Solar Service Pvt Ltd**.

Live website example:

```txt
https://svn-student-portal-noln.vercel.app/
```

This portal supports student registration, automatic Razorpay payments, manual QR payment verification, admin-controlled fee/QR settings, Excel export, email notifications, and student payment status tracking.

---

## Features

### Public Website

- Modern responsive home page
- Student registration form
- Conditional fields for `Others`
- Registration fee display
- Certificate verification redirect button
- Contact section
- Mobile responsive UI

### Student Registration

Required student fields:

- Full Name
- Father Name
- Date of Birth
- Gender
- Mobile Number
- Alternate Mobile
- Email
- College Name
- College Registration Number
- Branch
- Session

Automatic registration ID format:

```txt
SVN2026-0001
```

### Payment System

The portal supports two payment methods.

#### 1. Razorpay Automatic Payment

- Student fills form
- Student selects Razorpay
- Razorpay Checkout opens
- Student pays online
- Server verifies Razorpay signature
- Registration is created as `Verified`
- Student receives email confirmation

#### 2. Manual QR Payment

- Student selects Manual QR
- Student scans admin-uploaded QR
- Student enters UTR number / transaction ID
- Student uploads screenshot or PDF proof
- Registration is created as `Pending`
- Admin verifies or rejects payment
- Student receives email notification

### Admin Dashboard

Admin can:

- View dashboard analytics
- View all registrations
- Search students
- Filter by payment status
- Edit student details
- Delete student records
- View payment screenshot/proof
- Verify manual payments
- Reject manual payments with reason
- Export student data to Excel
- Change registration fee
- Upload/change QR code
- Enable/disable QR code
- Enable/disable registration form
- Change certificate verification URL

### Student Status Tracking

Students can check their payment/registration status at:

```txt
/status
```

Required:

- Registration ID
- Mobile number

Statuses:

```txt
Pending
Verified
Rejected
```

### Email Notifications

Email notification is sent for:

- Manual payment submitted: pending verification email
- Razorpay payment successful: payment success email
- Admin verifies manual payment: payment success email
- Admin rejects manual payment: rejection email with reason

Example success message:

```txt
Your payment is successful and your registration has been confirmed.
Registration ID: SVN2026-0001
```

---

## Tech Stack

### Frontend

- Next.js App Router
- React
- Tailwind CSS
- Framer Motion
- Lucide React Icons
- React Hot Toast

### Backend

- Next.js API Routes
- Node.js
- MongoDB Atlas
- Mongoose

### Authentication

- JWT
- bcryptjs
- HTTP-only cookie authentication

### Payments

- Razorpay Checkout
- Razorpay server-side signature verification
- Manual QR payment fallback

### File Upload

- Cloudinary for production uploads
- Local upload fallback for local/VPS use

### Excel Export

- xlsx package

### Email

- Nodemailer SMTP

---

## Project Structure

```txt
svn-student-portal/
├─ public/
│  └─ uploads/
│     ├─ payment-proofs/
│     └─ qr/
├─ scripts/
│  └─ seed-admin.mjs
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ register/route.ts
│  │  │  ├─ settings/route.ts
│  │  │  ├─ status/route.ts
│  │  │  ├─ payment/
│  │  │  │  ├─ create-order/route.ts
│  │  │  │  └─ verify/route.ts
│  │  │  └─ admin/
│  │  │     ├─ analytics/route.ts
│  │  │     ├─ export/route.ts
│  │  │     ├─ login/route.ts
│  │  │     ├─ logout/route.ts
│  │  │     ├─ me/route.ts
│  │  │     ├─ payments/[id]/route.ts
│  │  │     ├─ settings/route.ts
│  │  │     ├─ students/route.ts
│  │  │     └─ students/[id]/route.ts
│  │  ├─ admin/
│  │  │  ├─ login/page.tsx
│  │  │  └─ dashboard/page.tsx
│  │  ├─ register/page.tsx
│  │  ├─ status/page.tsx
│  │  ├─ page.tsx
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ Footer.tsx
│  │  ├─ Navbar.tsx
│  │  └─ StatCard.tsx
│  ├─ lib/
│  │  ├─ api.ts
│  │  ├─ auth.ts
│  │  ├─ db.ts
│  │  ├─ email.ts
│  │  ├─ file.ts
│  │  ├─ rateLimit.ts
│  │  ├─ registrationId.ts
│  │  ├─ settings.ts
│  │  └─ validation.ts
│  └─ models/
│     ├─ Admin.ts
│     ├─ Settings.ts
│     └─ Student.ts
├─ .env.example
├─ .gitignore
├─ README.md
├─ next.config.ts
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
└─ tsconfig.json
```

---

## Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Example `.env.local`:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/svn_student_portal?retryWrites=true&w=majority

JWT_SECRET=replace-with-a-long-secure-secret
JWT_EXPIRES_IN=7d

ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeMe@12345

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

CERTIFICATE_VERIFY_URL=https://example.com/verify
MAX_UPLOAD_MB=3

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=SVN Infra & Solar Service Pvt Ltd <your_email@gmail.com>
```

Generate JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## MongoDB Atlas Setup

1. Create MongoDB Atlas account.
2. Create a cluster.
3. Create database user from:

```txt
Database Access > Add New Database User
```

4. Give permission:

```txt
Read and write to any database
```

5. Allow network access:

```txt
Network Access > Add IP Address > 0.0.0.0/0
```

6. Copy Node.js driver connection string and place in `.env.local`:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/svn_student_portal?retryWrites=true&w=majority
```

If password contains special characters, URL encode it.

Example:

```txt
Admin@123 -> Admin%40123
```

---

## Razorpay Setup

1. Login to Razorpay Dashboard.
2. Go to:

```txt
Account & Settings > API Keys
```

3. Generate test or live keys.
4. Add to `.env.local` and Vercel:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

For production use live keys:

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=live_secret_here
```

Never expose `RAZORPAY_KEY_SECRET` in frontend code.

---

## Cloudinary Setup

Cloudinary is recommended for Vercel because Vercel filesystem is temporary.

1. Create account at:

```txt
https://cloudinary.com
```

2. Copy:

```txt
Cloud Name
API Key
API Secret
```

3. Add to `.env.local` and Vercel:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Used for:

- Manual payment screenshot upload
- Payment proof PDF/image upload
- Admin QR image upload

---

## Email SMTP Setup

For Gmail:

1. Enable 2-Step Verification in Google Account.
2. Create Gmail App Password.
3. Add SMTP values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=SVN Infra & Solar Service Pvt Ltd <your_email@gmail.com>
```

Do not use your normal Gmail password. Use Gmail App Password only.

---

## Local Installation

```bash
cd svn-student-portal
npm install
```

Test MongoDB connection:

```bash
node test-db.mjs
```

Expected:

```txt
Mongo URI exists: true
MongoDB connected successfully
```

Seed admin user:

```bash
npm run seed:admin
```

Expected:

```txt
Admin ready: admin
```

Run development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
http://localhost:3000/register
http://localhost:3000/status
http://localhost:3000/admin/login
```

---

## Build Locally

Stop dev server first:

```txt
Ctrl + C
```

Remove old build cache on Windows PowerShell:

```powershell
Remove-Item -Recurse -Force .next
```

Build:

```bash
npm run build
```

Start production server locally:

```bash
npm run start
```

---

## Admin Login

After seeding admin:

```txt
/admin/login
```

Use:

```txt
Username: value of ADMIN_USERNAME
Password: value of ADMIN_PASSWORD
```

Admin should immediately change/use a strong password in production by updating env and running seed again.

---

## Change Admin Password

Admin can change password from:

```txt
Admin Dashboard > Settings > Change Admin Password
```

The system asks for current password and new password. Password is saved as bcrypt hash in MongoDB.

If admin forgets password, reset it from local terminal by updating `.env.local` and running:

```bash
npm run seed:admin
```

Make sure `.env.local` uses the same production `MONGODB_URI` if you want to reset the live website admin password.

## Admin Workflow

1. Login to admin dashboard.
2. Go to Settings.
3. Configure:

```txt
Registration Fee
QR Code Image
QR Active/Inactive
Registration Active/Inactive
Certificate Verify URL
```

4. Go to Students & Payments.
5. Review manual payments.
6. Verify or reject payments.
7. Export Excel if needed.

---

## Student Payment Flow

### Razorpay Auto Flow

```txt
Student fills form
↓
Selects Razorpay
↓
Razorpay Checkout opens
↓
Payment successful
↓
Server verifies signature
↓
Registration created as Verified
↓
Email sent to student
```

### Manual QR Flow

```txt
Student fills form
↓
Selects Manual QR
↓
Scans QR uploaded by admin
↓
Enters UTR / transaction ID
↓
Uploads screenshot/PDF
↓
Registration created as Pending
↓
Email sent: pending verification
↓
Admin verifies/rejects
↓
Email sent to student
```

---

## Student Status Check

Students can check payment approval status at:

```txt
/status
```

They need:

```txt
Registration ID
Mobile Number
```

Status result can be:

```txt
Pending - Waiting for admin verification
Verified - Payment successful and registration confirmed
Rejected - Payment proof rejected
```

---

## Excel Export

Admin can export Excel from dashboard.

Export includes:

- Registration ID
- Student details
- College details
- Branch/session
- Payment status
- Payment mode
- Payment ID
- UTR number
- Razorpay order ID
- Payment timestamp
- Registration timestamp

---

## API Summary

### Public APIs

```txt
GET  /api/settings
POST /api/register
POST /api/status
POST /api/payment/create-order
POST /api/payment/verify
```

### Admin APIs

```txt
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me
GET    /api/admin/analytics
GET    /api/admin/students
GET    /api/admin/students/:id
PUT    /api/admin/students/:id
DELETE /api/admin/students/:id
PATCH  /api/admin/payments/:id
GET    /api/admin/settings
PUT    /api/admin/settings
GET    /api/admin/export
```

---

## Push to Same GitHub Repo

If this is already a git repo:

```bash
git status
git add .
git commit -m "Update payment status tracking and email notifications"
git push origin main
```

If you see:

```txt
fatal: not a git repository
```

Run:

```bash
cd D:\Desktop\svn-student-portal
git init
git remote add origin https://github.com/Sushantku1099/svn-student-portal.git
git branch -M main
git add .
git commit -m "Update payment status tracking and email notifications"
git push origin main --force
```

Before pushing, make sure `.env.local` is not committed.

Check `.gitignore` contains:

```gitignore
.env
.env.local
node_modules
.next
```

---

## Deploy on Vercel

1. Go to:

```txt
https://vercel.com
```

2. Import GitHub repository:

```txt
Sushantku1099/svn-student-portal
```

3. Framework:

```txt
Next.js
```

4. Build command:

```txt
npm run build
```

5. Add environment variables in:

```txt
Vercel Project > Settings > Environment Variables
```

Required production variables:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CERTIFICATE_VERIFY_URL=https://your-certificate-verification-site.com
MAX_UPLOAD_MB=3
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=SVN Infra & Solar Service Pvt Ltd <your_email@gmail.com>
```

6. Redeploy:

```txt
Deployments > Redeploy > Redeploy without build cache
```

---

## Production Checklist

```txt
[ ] npm install completed
[ ] .env.local configured locally
[ ] MongoDB connection tested
[ ] Admin seeded
[ ] Razorpay keys added
[ ] Cloudinary configured
[ ] SMTP email configured
[ ] Manual QR upload tested
[ ] Razorpay payment tested
[ ] Status page tested
[ ] Email notifications tested
[ ] npm run build successful
[ ] Code pushed to GitHub
[ ] Vercel environment variables added
[ ] Vercel redeployed without cache
[ ] Live website tested
```

---

## Important Security Notes

- Never commit `.env.local`.
- Never expose `RAZORPAY_KEY_SECRET` in frontend.
- Use strong `JWT_SECRET`.
- Use a strong admin password.
- Use MongoDB Atlas Network Access carefully.
- For easiest Vercel deployment, Atlas Network Access can use `0.0.0.0/0`, but production security should be reviewed.
- Use Cloudinary/S3/R2 for uploaded files in production.
- Use Gmail App Password or a dedicated SMTP provider for emails.

---

## License

Private project for **SVN Infra & Solar Service Pvt Ltd**.
