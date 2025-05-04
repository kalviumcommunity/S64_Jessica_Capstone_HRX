const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Core authentication fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['admin', 'hr', 'employee'], default: 'employee', index: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  // Basic profile info
  phone: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  emergencyContact: { type: String },
  emergencyPhone: { type: String },
  // Professional info
  department: { type: String, index: true },
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
  // App preferences
  appPreferences: {
    darkMode: { type: Boolean, default: false },
    systemLanguage: { type: Boolean, default: true },
    highContrast: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false }
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Create indexes
userSchema.index({ email: 1, role: 1 });

// Password Hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
