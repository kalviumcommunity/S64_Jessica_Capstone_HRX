const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  payPeriodEnd: {
    type: Date,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  basicSalary: { 
    type: Number, 
    required: true 
  },
  allowances: { 
    type: Number, 
    default: 0 
  },
  bonus: { 
    type: Number, 
    default: 0 
  },
  overtime: { 
    type: Number, 
    default: 0 
  },
  tax: { 
    type: Number, 
    default: 0 
  },
  insurance: { 
    type: Number, 
    default: 0 
  },
  netPay: { 
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid'],
    default: 'Pending'
  },
  payslipUrl: { 
    type: String 
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
