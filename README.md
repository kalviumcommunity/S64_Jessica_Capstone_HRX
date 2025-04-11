# HRX - Human Resource Management System (HRMS Pro) 🧑‍💼🚀

HRX is a modern, full-stack Human Resource Management System (HRMS) designed to streamline HR processes. It enables HR teams to efficiently manage employees, handle payroll, track performance, and process leave applications — all from a clean and intuitive interface.

---

## 📌 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## ✨ Features

### 1. Employee Management: 
Add, edit, and manage employee details, roles, and departments.

### 2. Auth & Roles: 
Secure JWT login with role-based access (Admin/HR/Employee) and Google OAuth.

### 3. Leave Management: 
Apply, approve/reject leaves with live balance tracking.

### 4. Mock Payroll: 
Auto salary calculation, payslip generation, and payroll history.

### 5.  Performance Tracking: 
Monitor KPIs, give feedback, and log performance for appraisals.

### 6. Attendance Management: 
Mark daily attendance, track presence/absence, and view logs.

---

## 🛠️ Tech Stack

### 🔹 Frontend
- React.js (Vite)
- TailwindCSS
- Zustand
- Axios

### 🔸 Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Auth + Google OAuth

### 🔧 Dev Tools
- Postman
- Nodemon

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hrx.git
cd hrx
```

### 2. Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Create Environment Variables

Inside `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Start the Application

```bash
# Backend
cd server
npm run dev

# Frontend
cd ../client
npm run dev
```

---

## 📁 Project Structure

```
hrx/
├── client/           # Frontend 
│   └── src/
├── server/           # Backend 
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── server.js
├── .env
└── README.md
```

---

## Deployment:

#### Render deployment link : https://s64-jessica-capstone-hrx.onrender.com
---

## 🤝 Contributing

We welcome all contributions to HRX!  
To contribute:

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature-name`)  
3. Commit your changes  
4. Push and open a PR 🚀

---

> Made with ❤️ by **Jessica Agarwal**
