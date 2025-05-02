const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  emergencyContact: { type: String },
  emergencyPhone: { type: String },
  department: { type: String },
  position: { type: String },
  jobRole: { type: String },
  joinDate: { type: Date },
  manager: { type: String },
  workLocation: { type: String },
  workEmail: { type: String },
  workPhone: { type: String },
  education: { type: String },
  skills: { type: String },
  salary: { type: Number },
  accountName: { type: String },
  accountNumber: { type: String },
  bankName: { type: String },
  branch: { type: String },
  ifscCode: { type: String },
  panCard: { type: String },
  taxInformation: { type: String },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  employmentHistory: [
    {
      role: String,
      department: String,
      from: Date,
      to: Date,
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  employeeId: { type: String, unique: true, required: true },
  role: { type: String, default: 'employee' },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);