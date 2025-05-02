const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'hr', 'employee'], default: 'employee' },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  // Personal info
  phone: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  emergencyContact: { type: String },
  emergencyPhone: { type: String },
  // Professional info
  department: { type: String },
  position: { type: String },
  joinDate: { type: Date },
  manager: { type: String },
  workLocation: { type: String },
  workEmail: { type: String },
  workPhone: { type: String },
  education: { type: String },
  skills: { type: String },
  // Bank info
  accountName: { type: String },
  accountNumber: { type: String },
  bankName: { type: String },
  branch: { type: String },
  ifscCode: { type: String },
  panCard: { type: String },
  salary: { type: String },
  taxInformation: { type: String },
  appPreferences: {
    darkMode: { type: Boolean, default: false },
    systemLanguage: { type: Boolean, default: true },
    highContrast: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Password Hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password Match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
