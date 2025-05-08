// Leave-related utility functions
export const calculateLeaveDays = (startDate, endDate, isHalfDay) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isHalfDay ? days * 0.5 : days;
};

export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export const getLeaveBalance = (leaveType, totalDays, usedDays) => {
  const balance = totalDays - usedDays;
  return {
    total: totalDays,
    used: usedDays,
    remaining: balance,
    percentage: Math.round((usedDays / totalDays) * 100 * 100) / 100 // Round to 2 decimal places
  };
};

export const validateLeaveDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  // Set hours to 0 for date comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  if (start <= today) {
    return { isValid: false, error: 'Start date cannot be today or in the past' };
  }
  
  if (end < start) {
    return { isValid: false, error: 'End date cannot be before start date' };
  }
  
  return { isValid: true };
};

// Tests
describe('Leave Utility Functions', () => {
  test('calculates leave days correctly', () => {
    const start = '2024-03-15';
    const end = '2024-03-17';
    
    expect(calculateLeaveDays(start, end, false)).toBe(3);
    expect(calculateLeaveDays(start, end, true)).toBe(1.5);
  });

  test('identifies weekends correctly', () => {
    // March 16, 2024 is a Saturday
    expect(isWeekend('2024-03-16')).toBe(true);
    // March 17, 2024 is a Sunday
    expect(isWeekend('2024-03-17')).toBe(true);
    // March 15, 2024 is a Friday
    expect(isWeekend('2024-03-15')).toBe(false);
  });

  test('calculates leave balance correctly', () => {
    const balance = getLeaveBalance('annual', 12, 5);
    
    expect(balance.total).toBe(12);
    expect(balance.used).toBe(5);
    expect(balance.remaining).toBe(7);
    expect(balance.percentage).toBe(41.67);
  });

  test('validates leave dates correctly', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Valid dates
    expect(validateLeaveDates(tomorrow, nextWeek).isValid).toBe(true);
    
    // Invalid dates
    expect(validateLeaveDates(today, tomorrow).isValid).toBe(false);
    expect(validateLeaveDates(nextWeek, tomorrow).isValid).toBe(false);
  });
}); 