# RentasBuddy Deployment & Environment Configuration Guide

This guide details deployment options for **RentasBuddy** with **Zero Vendor Lock-In**, running either on **Hostinger (VPS or Cloud Panel)** or **Vercel / Cloud Run / Railway / DigitalOcean**.

---

## 1. Environment Variables Checklist

Ensure the following variables are configured in your server environment:

| Variable | Description | Example / Note |
|---|---|---|
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_...` or `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key | Server-only secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client checkout script Key ID | Matches `RAZORPAY_KEY_ID` |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook HMAC verification secret | Configured in Razorpay Webhooks tab |
| `PAYMENT_MODE` | Payment processing environment | `test` or `live` |
| `SENDGRID_API_KEY` | SendGrid Mail API Key | Connection OTP & transactional emails |
| `SENDGRID_FROM_EMAIL` | Verified SendGrid sender email | E.g. `arvindyadav70075@gmail.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | Configured in client |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | E.g. `rentbuddy-23ba6` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Service Account Email | Optional server admin credential |
| `FIREBASE_PRIVATE_KEY` | Firebase Service Account Key | Optional (falls back to REST API) |
| `PORT` | Node.js HTTP listener port | Default `3000` (auto-detected on Hostinger) |

---

## 2. Deploying on Hostinger (Node.js App / VPS)

### Option A: Hostinger VPS with PM2 & Nginx (Recommended for Production)

1. **Install Node.js (v20+ LTS) and PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Clone & Setup the Project**:
   ```bash
   git clone <YOUR_GIT_REPO_URL> /var/www/rentasbuddy
   cd /var/www/rentasbuddy
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.local.example .env.local
   nano .env.local
   # Fill in Razorpay, Firebase, SendGrid, and PORT credentials
   ```

4. **Build Production Application**:
   ```bash
   npm run build
   ```

5. **Start with PM2**:
   ```bash
   pm2 start npm --name "rentasbuddy" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx Reverse Proxy**:
   In `/etc/nginx/sites-available/rentasbuddy`:
   ```nginx
   server {
       listen 80;
       server_name rentasbuddy.com www.rentasbuddy.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Enable site and activate SSL:
   ```bash
   sudo ln -s /etc/nginx/sites-available/rentasbuddy /etc/nginx/sites-enabled/
   sudo certbot --nginx -d rentasbuddy.com -d www.rentasbuddy.com
   ```

---

## 3. Deploying on Vercel

1. Import the Git repository in Vercel dashboard.
2. Select **Next.js** framework preset.
3. Paste all environment variables from `.env.local` into the **Environment Variables** section.
4. Deploy. All API routes have `export const runtime = 'nodejs';` configured to avoid Edge runtime incompatibilities.

---

## 4. Razorpay Webhook Configuration

1. In the Razorpay Dashboard -> **Settings** -> **Webhooks** -> **Add New Webhook**.
2. Set Webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Enter Secret matching `RAZORPAY_WEBHOOK_SECRET`.
4. Select active events:
   - `payment.captured`
   - `order.paid`
   - `payment.failed`
5. Save Webhook.

