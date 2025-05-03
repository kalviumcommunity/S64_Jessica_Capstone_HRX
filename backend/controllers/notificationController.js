// Get employee notifications
exports.getEmployeeNotifications = async (req, res) => {
  try {
    // In a real app, this would query a notifications table
    // For now, we'll return a simple mock response
    const notifications = [
      {
        id: '1',
        title: 'Leave Approved',
        message: 'Your leave request for next week has been approved.',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        read: true
      },
      {
        id: '2',
        title: 'New Payslip Available',
        message: 'Your payslip for April 2025 is now available.',
        date: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
        read: false
      },
      {
        id: '3',
        title: 'Performance Review Scheduled',
        message: 'Your quarterly performance review is scheduled for next Monday.',
        date: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        read: false
      }
    ];
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};