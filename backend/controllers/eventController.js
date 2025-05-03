// Get employee events
exports.getEmployeeEvents = async (req, res) => {
  try {
    // In a real app, this would query an events table
    // For now, we'll return a simple mock response
    const events = [
      {
        id: '1',
        title: 'Team Meeting',
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        location: 'Conference Room A',
        description: 'Weekly team sync-up meeting'
      },
      {
        id: '2',
        title: 'Project Deadline',
        date: new Date(Date.now() + 7 * 86400000).toISOString(), // Next week
        location: 'N/A',
        description: 'Final submission for Q2 project'
      },
      {
        id: '3',
        title: 'Company Offsite',
        date: new Date(Date.now() + 14 * 86400000).toISOString(), // Two weeks from now
        location: 'Mountain Resort',
        description: 'Annual company retreat and team building'
      }
    ];
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};