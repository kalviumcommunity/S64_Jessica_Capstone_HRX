const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewPeriod: {
    type: String, // "Q1 2025" or "Apr-Jun 2025"
    required: true
  },
  kpis: [
    {
      metric: String,
      score: Number, // e.g., 0–10 or 0–100
      weightage: Number
    }
  ],
  overallRating: Number, // optional summary score
  feedback: String,
  nextGoals: String,
  reviewDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);
