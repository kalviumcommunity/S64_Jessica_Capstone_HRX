const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import your route files
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.get('/', (req, res) => {
  res.send('HRX API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
