const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const bcrypt = require('bcryptjs');
const redisClient = require('../config/redisClient');

// Initialize cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Google Auth Handler
exports.googleAuth = async (req, res) => {
  const { email, name, photoURL, uid, role } = req.body;

  try {
    if (!email || !name || !uid) {
      return res.status(400).json({ message: 'Missing required Google auth fields' });
    }

    console.log('Google Auth Request:', { email, uid, role });

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = uid;
        user.photoURL = photoURL;
        await user.save();
      }
    } else {
      user = await User.create({
        email,
        name,
        photoURL,
        googleId: uid,
        role: role || 'employee',
      });
    }

    // Avoid duplicate employee records
    let employee = await Employee.findOne({ createdBy: user._id });

    if (!employee) {
      // ✅ Generate a simple employeeId (customize if needed)
      const generatedEmployeeId = `EMP-${Date.now()}`;

      employee = await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: user._id,
        employeeId: generatedEmployeeId, // 🔧 fix applied here
      });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.photoURL || user.avatar,
      employeeProfile: employee,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('Google auth error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Duplicate user or Google ID' });
    }
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });

    const generatedEmployeeId = `EMP-${Date.now()}`;

    await Employee.create({
      name: user.name,
      email: user.email,
      createdBy: user._id,
      employeeId: generatedEmployeeId,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const cacheKey = `user:${email}`;
    let user = null;
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      user = await User.findOne({ email })
        .select('_id name email role avatar password')
        .lean();
      if (user) {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(user));
      }
    }
    if (user && await bcrypt.compare(password, user.password)) {
      const employeeCacheKey = `employee:${user._id}`;
      let employee = null;
      const cachedEmployee = await redisClient.get(employeeCacheKey);
      if (cachedEmployee) {
        employee = JSON.parse(cachedEmployee);
      } else {
        employee = await Employee.findOne({ createdBy: user._id })
          .select('_id name email position department')
          .lean();
        if (employee) {
          await redisClient.setEx(employeeCacheKey, 300, JSON.stringify(employee));
        }
      }
      delete user.password;
      const response = {
        ...user,
        employeeProfile: employee,
        token: generateToken(user._id),
      };
      res.json(response);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Google User Existence & Role Check
exports.googleCheck = async (req, res) => {
  const { email, uid } = req.body;
  try {
    if (!email && !uid) {
      return res.status(400).json({ message: 'Missing email or uid' });
    }
    // Try to find by email or googleId
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    }
    if (!user && uid) {
      user = await User.findOne({ googleId: uid });
    }
    if (!user) {
      return res.json(null);
    }
    // Optionally, fetch employee profile if needed
    let employee = null;
    if (user.role === 'employee') {
      employee = await Employee.findOne({ createdBy: user._id });
    }
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.photoURL || user.avatar,
      employeeProfile: employee,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google check error:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

exports.checkPhoneAuth = async (req, res) => {
  const { phoneNumber, uid } = req.body;
  try {
    if (!phoneNumber || !uid) {
      return res.status(400).json({ message: 'Missing phone number or uid' });
    }

    // 1. Check if user exists by phone
    let user = await User.findOne({ phone: phoneNumber });

    // 2. If not, create a new user with a dummy unique email
    if (!user) {
      const dummyEmail = `phoneuser+${uid}@yourdomain.com`;
      user = await User.create({
        phone: phoneNumber,
        email: dummyEmail,
        googleId: uid, // or use a separate field for phone auth UID if you want
        role: 'employee',
        name: 'Phone User', // You can update this later
        password: '', // Not used for phone users
      });

      // Optionally, create an employee profile
      const generatedEmployeeId = `EMP-${Date.now()}`;
      await Employee.create({
        name: user.name,
        email: user.email,
        createdBy: user._id,
        employeeId: generatedEmployeeId,
      });
    }

    // 3. Fetch employee profile if needed
    let employee = null;
    if (user.role === 'employee') {
      employee = await Employee.findOne({ createdBy: user._id });
    }

    // 4. Return user data and JWT token
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      employeeProfile: employee,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Phone auth error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
