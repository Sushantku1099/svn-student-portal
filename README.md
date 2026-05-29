# SVN Infra & Solar Service Pvt Ltd - Student Registration Portal

A production-ready full-stack Student Registration Portal with Razorpay QR payment proof flow, MongoDB Atlas storage, JWT admin authentication, dashboard analytics, student/payment management, settings management, QR upload and XLSX export.

## Features

- Modern responsive public landing page
- Student registration form with validation and conditional fields
- Configurable registration fee from admin panel
- Dynamic Razorpay QR image upload/preview/activation
- Automatic Razorpay Checkout order creation and server-side signature verification
- Payment ID
- Razorpay Order ID, order ID and timestamp storage
- Automatic registration ID generation, e.g. `SVN2026-0001`
- Secure admin login with bcrypt password hash + JWT httpOnly cookie
- Dashboard analytics: total registrations, verified payments, pending, rejected, today's registrations
- Student search, filtering, edit, delete and payment proof view
- Payment verification/rejection workflow
- Excel export for all/filtered students
- Certificate verification button in navbar/footer with configurable redirect URL
- MongoDB Atlas schemas for Student, Admin and Settings
- Basic rate limiting, upload restrictions and server-side validation

## Tech Stack

- **Frontend:** Next.js App Router, React, Tailwind CSS, Framer Motion, Lucide Icons, react-hot-toast
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT + bcryptjs
- **File Upload:** Next.js FormData file handling to `public/uploads` by default
- **Excel:** `xlsx`

## Project Structure

```txt
svn-student-portal/
├─ public/uploads/
│  ├─ payment-proofs/
│  └─ qr/
├─ scripts/seed-admin.mjs
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ register/route.ts
│  │  │  ├─ settings/route.ts
│  │  │  └─ admin/
│  │  │     ├─ analytics/route.ts
│  │  │     ├─ export/route.ts
│  │  │     ├─ login/route.ts
│  │  │     ├─ logout/route.ts
│  │  │     ├─ me/route.ts
│  │  │     ├─ payments/[id]/route.ts
│  │  │     ├─ settings/route.ts
│  │  │     └─ students/[id]/route.ts
│  │  ├─ admin/login/page.tsx
│  │  ├─ admin/dashboard/page.tsx
│  │  ├─ register/page.tsx
│  │  ├─ page.tsx
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/
│  ├─ lib/
│  └─ models/
├─ .env.example
├─ next.config.ts
├─ tailwind.config.ts
└─ package.json
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set values:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/svn_student_portal?retryWrites=true&w=majority
JWT_SECRET=use-a-long-random-secret-at-least-64-characters
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeMe@12345
CERTIFICATE_VERIFY_URL=https://your-live-certificate-site.com/verify
MAX_UPLOAD_MB=3

# Razorpay automatic checkout
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Local Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local
npm run seed:admin
npm run dev
```

Open:

- Website: `http://localhost:3000`
- Registration: `http://localhost:3000/register`
- Admin Login: `http://localhost:3000/admin/login`

Default admin is created from `ADMIN_USERNAME` and `ADMIN_PASSWORD` when you run `npm run seed:admin`.

## Admin Workflow

1. Login to `/admin/login`.
2. Go to **Settings**:
   - Set registration fee
   - Upload Razorpay QR image
   - Enable/disable registration form
   - Activate/deactivate QR code
   - Set certificate verification URL
3. Go to **Students & Payments**:
   - Search/filter students
   - View uploaded payment proof
   - Verify/reject payment
   - Edit/delete records
   - Export XLSX

## Registration Payment Flow

### Automatic Razorpay Checkout Flow

1. Student fills the registration form.
2. Frontend calls `POST /api/payment/create-order`.
3. Server reads the current registration fee from Settings and creates a Razorpay order.
4. Razorpay Checkout opens on the frontend.
5. After successful payment, frontend sends Razorpay payment response to `POST /api/payment/verify`.
6. Server verifies `razorpay_order_id | razorpay_payment_id` using HMAC SHA256 and `RAZORPAY_KEY_SECRET`.
7. If valid, student registration is created with `paymentStatus: Verified`.
8. A unique registration ID is generated automatically.

### Manual QR Fallback

The project still contains QR upload/settings and `/api/register` manual proof API if you want to keep offline/manual QR verification as a backup.

## Database Schemas

### Student

- registrationId
- fullName
- fatherName
- dob
- gender
- mobile
- alternateMobile
- email
- collegeName
- customCollegeName
- registrationNumber
- branch
- customBranch
- session
- customSession
- paymentStatus
- paymentId
- paymentScreenshot
- paymentTimestamp
- createdAt / updatedAt

### Admin

- username
- passwordHash
- role

### Settings

- registrationFee
- qrCodeImage
- certificateVerifyUrl
- registrationEnabled
- qrEnabled

## API Summary

### Public

- `GET /api/settings` - public settings for fee, QR and verify URL
- `POST /api/register` - create student registration with optional payment proof
- `POST /api/payment/create-order` - create Razorpay Checkout order
- `POST /api/payment/verify` - verify Razorpay signature and create verified registration

### Admin

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `GET /api/admin/analytics`
- `GET /api/admin/students?q=&status=&page=&limit=`
- `GET /api/admin/students/:id`
- `PUT /api/admin/students/:id`
- `DELETE /api/admin/students/:id`
- `PATCH /api/admin/payments/:id`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `GET /api/admin/export?q=&status=`

## Production Notes

### File Uploads

This implementation saves uploaded files under `public/uploads`. This is fine for VPS deployments with persistent disk. On serverless platforms such as Vercel, local uploaded files are not persistent. For production serverless deployment, replace `src/lib/file.ts` with Cloudinary/S3/R2 upload logic and store the returned secure URL in MongoDB.

### Security Checklist

- Use HTTPS in production.
- Use a long `JWT_SECRET`.
- Change default admin password immediately.
- Restrict MongoDB Atlas network access where possible.
- Use Cloudinary/S3 for production uploads.
- Add CAPTCHA for high-traffic public registration if needed.
- Place the app behind a WAF/CDN for advanced rate limiting.
- Periodically export and back up MongoDB data.

## Deployment Guide

### Option A: VPS / Node Server

1. Install Node.js LTS and PM2.
2. Clone/copy project.
3. Create `.env.local` or system environment variables.
4. Install dependencies and build:

```bash
npm ci
npm run seed:admin
npm run build
pm2 start npm --name svn-student-portal -- start
```

5. Configure Nginx reverse proxy to `localhost:3000`.
6. Enable SSL with Certbot.
7. Ensure `public/uploads` is backed up and writable.

### Option B: Vercel

1. Push project to GitHub.
2. Import repository in Vercel.
3. Add all environment variables in Vercel dashboard.
4. Deploy.
5. Run `npm run seed:admin` locally with production `MONGODB_URI`, or create a temporary protected seed endpoint.
6. Replace local uploads with Cloudinary/S3 because Vercel filesystem is ephemeral.

## Customization

- Company/contact information: update `src/components/Footer.tsx` and `src/app/page.tsx`.
- Dropdown values: update `src/app/register/page.tsx`.
- Registration ID format: update `src/lib/registrationId.ts`.
- Validation: update `src/lib/validation.ts`.

## License

Private project for SVN Infra & Solar Service Pvt Ltd.


## Razorpay Automatic Payment Setup

1. Create a Razorpay account and complete required KYC/business activation.
2. Go to Razorpay Dashboard > Account & Settings > API Keys.
3. Generate keys for test or live mode.
4. Add keys to `.env.local`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

5. Restart the Next.js server after changing environment variables:

```bash
npm run dev
```

For production, replace test keys with live keys:

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=live_secret_here
```

Never expose `RAZORPAY_KEY_SECRET` in frontend code. This project only returns `RAZORPAY_KEY_ID` to the browser and verifies the signature securely on the backend.


## Email Notification Setup

The portal can send automatic emails to students for payment/registration status:

- Manual QR submitted: pending verification email
- Admin verifies payment: payment successful email with registration ID
- Admin rejects payment: rejected email with reason
- Razorpay successful payment: instant payment successful email with registration ID

Add SMTP variables locally and in Vercel:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=SVN Infra & Solar Service Pvt Ltd <your_email@gmail.com>
```

For Gmail, create an App Password from Google Account > Security > 2-Step Verification > App passwords. Do not use your normal Gmail password.

## Student Status Tracking

Students can check payment/registration status from:

```txt
/status
```

They need:

- Registration ID
- Mobile number

The status page shows Pending, Verified, or Rejected with payment mode and payment ID/UTR.
