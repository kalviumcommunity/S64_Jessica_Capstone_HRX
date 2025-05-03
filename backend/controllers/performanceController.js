const Performance = require('../models/Performance');
const Employee = require('../models/Employee');

// Get employee performance
exports.getEmployeePerformance = async (req, res) => {
  try {
    // Find the employee's most recent performance review
    const latestPerformance = await Performance.findOne({ employee: req.params.id })
      .sort({ reviewDate: -1 });
    
    // Find the previous performance review
    const previousPerformance = await Performance.findOne({ 
      employee: req.params.id,
      reviewDate: { $lt: latestPerformance?.reviewDate || new Date() }
    }).sort({ reviewDate: -1 });
    
    // Calculate next review date (3 months from last review)
    const nextReviewDate = latestPerformance 
      ? new Date(latestPerformance.reviewDate.getTime() + (90 * 24 * 60 * 60 * 1000))
      : new Date(Date.now() + (90 * 24 * 60 * 60 * 1000));
    
    res.json({
      overallRating: latestPerformance?.overallRating || 0,
      previousRating: previousPerformance?.overallRating || 0,
      nextReviewDate: nextReviewDate,
      reviewPeriod: latestPerformance?.reviewPeriod || 'Not Started',
      lastReviewDate: latestPerformance?.reviewDate || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee skills
exports.getEmployeeSkills = async (req, res) => {
  try {
    // Find the employee's most recent performance review
    const latestPerformance = await Performance.findOne({ employee: req.params.id })
      .sort({ reviewDate: -1 });
    
    if (!latestPerformance || !latestPerformance.kpis || latestPerformance.kpis.length === 0) {
      // If no performance review or KPIs found, return default skills
      return res.json([
        { name: 'Communication', rating: 0, maxRating: 5 },
        { name: 'Technical Knowledge', rating: 0, maxRating: 5 },
        { name: 'Problem Solving', rating: 0, maxRating: 5 },
        { name: 'Teamwork', rating: 0, maxRating: 5 },
        { name: 'Leadership', rating: 0, maxRating: 5 }
      ]);
    }
    
    // Format the KPIs as skills
    const skills = latestPerformance.kpis.map(kpi => ({
      name: kpi.metric,
      rating: kpi.score || 0,
      maxRating: 5 // Using a 5-point scale
    }));
    
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee goals
exports.getEmployeeGoals = async (req, res) => {
  try {
    // Find the employee's most recent performance review
    const latestPerformance = await Performance.findOne({ employee: req.params.id })
      .sort({ reviewDate: -1 });
    
    if (!latestPerformance || !latestPerformance.nextGoals) {
      // If no performance review or goals found, return an empty array
      return res.json([]);
    }
    
    // Parse the nextGoals field
    let goals = [];
    try {
      // Try to parse as JSON
      goals = JSON.parse(latestPerformance.nextGoals);
    } catch (e) {
      // If not JSON, split by commas and format
      const goalsList = latestPerformance.nextGoals.split(',').map(goal => goal.trim());
      goals = goalsList.map((goal, index) => ({
        id: index + 1,
        title: goal,
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        status: 'In Progress',
        progress: 0
      }));
    }
    
    // Ensure each goal has all required fields
    goals = goals.map((goal, index) => ({
      id: goal.id || index + 1,
      title: goal.title || 'Untitled Goal',
      dueDate: goal.dueDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: goal.status || 'In Progress',
      progress: goal.progress || 0
    }));
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee feedback
exports.getEmployeeFeedback = async (req, res) => {
  try {
    // Find all performance reviews for the employee
    const reviews = await Performance.find({ employee: req.params.id })
      .sort({ reviewDate: -1 })
      .populate('reviewer', 'name');
    
    // Format the feedback
    const feedback = reviews.map(review => ({
      _id: review._id,
      date: review.reviewDate,
      reviewer: review.reviewer,
      feedback: review.feedback || '',
      rating: review.overallRating || 0
    }));
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add performance review
exports.addReview = async (req, res) => {
  try {
    // Create the review with the rating field
    const review = await Performance.create({
      ...req.body,
      reviewer: req.user._id,
      overallRating: req.body.rating // Map the rating from frontend to overallRating
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Performance.find()
      .populate('employee')
      .populate('reviewer')
      .sort({ reviewDate: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews by employee
exports.getEmployeeReviews = async (req, res) => {
  try {
    const reviews = await Performance.find({ employee: req.params.id })
      .populate('reviewer');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPerformanceStats = async (req, res) => {
  try {
    const reviews = await Performance.find();
    const total = reviews.length;
    const averageRating = total > 0 ? (reviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / total) : 0;
    const topPerformersCount = reviews.filter(r => (r.overallRating || 0) >= 4.5).length;
    
    res.json({
      averageRating,
      upcomingReviewsCount: 0,
      topPerformersCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUpcomingReviews = async (req, res) => {
  try {
    const reviews = await Performance.find({
      reviewDate: { $gte: new Date() }
    })
    .populate('employee')
    .populate('reviewer')
    .sort({ reviewDate: 1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewTemplates = async (req, res) => {
  try {
    // For demo, return empty array
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};