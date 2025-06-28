
# HRX – Human Resource Management System 🧑‍💼🚀

**HRX** is a scalable full-stack HRMS application that streamlines employee management, attendance tracking, leave approvals, payroll generation, and performance reviews. It features secure authentication (Google login + OTP), role-based access, dynamic payroll with PDF generation, and backend optimization using Redis caching and API rate limiting.

---

## 🔥 Highlights

- 🔐 Firebase Authentication (Google login + OTP) with JWT-protected sessions
- 💼 Role-based access control: Admin, HR, Employee
- 📆 Leave & attendance tracking with live dashboards
- 💸 Dynamic payroll with downloadable PDF payslips
- 📁 Cloudinary integration for document uploads
- ⚡ Redis caching & rate limiting: 60–80% fewer DB queries, ~66% faster APIs
- 🧪 Backend tests written using Jest
- 📩 Contact form email handling via Nodemailer
- 🚀 Deployed via Netlify (frontend) and Render (backend)

---

## 🛠️ Tech Stack

### 🔹 Frontend
- React.js (Vite), TailwindCSS
- Redux Toolkit, React Router DOM
- Axios, Framer Motion, Radix UI
- Firebase Authentication (Google login + OTP)

### 🔸 Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Firebase Admin SDK
- JWT (authorization)
- Redis (caching)
- Cloudinary (uploads), PDFKit (payslips)
- Express Rate Limit, Helmet, CORS, Nodemailer

---

## 🚀 Live Demo

- **Frontend**: [https://hr-hrx.netlify.app](https://hr-hrx.netlify.app)  
- **Backend**: [https://s64-jessica-capstone-hrx.onrender.com](https://s64-jessica-capstone-hrx.onrender.com)

---

## ⚙️ Local Setup

```bash
# Clone the repo
git clone https://github.com/kalviumcommunity/S64_Jessica_Capstone_HRX.git
cd HRX

# Install frontend dependencies
cd client
npm install
npm run dev

# Install backend dependencies
cd ../backend
npm install
npm run dev
```

---

## 🔐 Environment Variables

<details>
<summary><code>/backend/.env</code></summary>

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

REDIS_URL=your_redis_url

EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
ADMIN_EMAIL=your_email

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_email
FIREBASE_CLIENT_ID=your_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

</details>

<details>
<summary><code>/client/.env</code></summary>

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_key
```

</details>

---

## 📄 License

Licensed under the [MIT License](./LICENSE)

---

> Capstone Project by **Jessica Agarwal**  
> [GitHub](https://github.com/jessicaagarwal) | [LinkedIn](https://www.linkedin.com/in/jessica-agarwal-00b6b7225/)
