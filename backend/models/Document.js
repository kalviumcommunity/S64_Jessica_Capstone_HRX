const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false
  },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['personal', 'payroll', 'company'],
    default: 'personal'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
