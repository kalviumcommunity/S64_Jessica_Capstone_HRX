const express = require('express');
const { 
  addEmployee, 
  getEmployees, 
  getEmployeeById, 
  getEmployeeByUserId,
  getAllEmployees,
  createEmployee,
  createEmployeeWithCredentials,
  getEmployeesForHR
} = require('../controllers/employeeController');
const Employee = require('../models/Employee');
const router = express.Router();

// Get all employees
router.get('/', getEmployees);

// Create new employee
router.post('/', addEmployee);

// Create employee with credentials
router.post('/create-with-credentials', createEmployeeWithCredentials);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Get employee by user ID
router.get('/user/:id', getEmployeeByUserId);

// Get employee by user ID (createdBy)
router.get('/by-user/:userId', async (req, res) => {
  try {
    console.log('Looking up employee for user:', req.params.userId);
    
    const employee = await Employee.findOne({
      $or: [
        { user: req.params.userId },
        { createdBy: req.params.userId }
      ]
    }).exec();
    
    console.log('Found employee:', employee);
    
    if (!employee) {
      console.log('No employee found for user:', req.params.userId);
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (err) {
    console.error('Error finding employee:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
