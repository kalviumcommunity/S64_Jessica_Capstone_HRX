const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const bcrypt = require('bcryptjs');

// Initialize cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Create user
    const user = await User.create({ name, email, password, role });

    // Create employee record for the user
    await Employee.create({
      name: user.name,
      email: user.email,
      createdBy: user._id
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
    // Check cache first
    const cacheKey = `user:${email}`;
    let user = cache.get(cacheKey);

    if (!user) {
      // If not in cache, query database with only necessary fields
      user = await User.findOne({ email })
        .select('_id name email role avatar password')
        .lean(); // Convert to plain JS object for better performance
      
      if (user) {
        // Cache the user data
        cache.set(cacheKey, user);
      }
    }

    if (user && await bcrypt.compare(password, user.password)) {
      // Get employee profile (with caching)
      const employeeCacheKey = `employee:${user._id}`;
      let employee = cache.get(employeeCacheKey);

      if (!employee) {
        employee = await Employee.findOne({ createdBy: user._id })
          .select('_id name email position department')
          .lean();
        
        if (employee) {
          cache.set(employeeCacheKey, employee);
        }
      }

      // Remove password from response
      delete user.password;

      // Generate response
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
