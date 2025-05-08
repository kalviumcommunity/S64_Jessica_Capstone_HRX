// Attendance-related utility functions
export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
};

export const isLate = (checkIn, startTime = '09:00') => {
  if (!checkIn) return false;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const checkInDate = new Date(checkIn);
  const checkInHour = checkInDate.getHours();
  const checkInMinute = checkInDate.getMinutes();
  
  return checkInHour > startHour || 
         (checkInHour === startHour && checkInMinute > startMinute);
};

export const calculateOvertime = (workingHours, standardHours = 8) => {
  return Math.max(0, workingHours - standardHours);
};

export const getAttendanceStatus = (checkIn, checkOut, startTime = '09:00', endTime = '17:00') => {
  if (!checkIn) return 'Absent';
  if (!checkOut) return 'Present';
  
  const hours = calculateWorkingHours(checkIn, checkOut);
  if (hours < 4) return 'Half Day';
  if (hours >= 8) return 'Full Day';
  return 'Present';
};

// Tests
describe('Attendance Utility Functions', () => {
  test('calculates working hours correctly', () => {
    const checkIn = '2024-03-15T09:00:00';
    const checkOut = '2024-03-15T17:00:00';
    
    expect(calculateWorkingHours(checkIn, checkOut)).toBe(8);
    expect(calculateWorkingHours(checkIn, null)).toBe(0);
  });

  test('identifies late arrival correctly', () => {
    const onTime = '2024-03-15T08:55:00';
    const late = '2024-03-15T09:05:00';
    
    expect(isLate(onTime)).toBe(false);
    expect(isLate(late)).toBe(true);
  });

  test('calculates overtime correctly', () => {
    expect(calculateOvertime(9)).toBe(1);
    expect(calculateOvertime(8)).toBe(0);
    expect(calculateOvertime(7)).toBe(0);
  });

  test('determines attendance status correctly', () => {
    const fullDay = {
      checkIn: '2024-03-15T09:00:00',
      checkOut: '2024-03-15T17:00:00'
    };
    
    const halfDay = {
      checkIn: '2024-03-15T09:00:00',
      checkOut: '2024-03-15T12:00:00'  // Changed to 3 hours to ensure half day
    };
    
    expect(getAttendanceStatus(fullDay.checkIn, fullDay.checkOut)).toBe('Full Day');
    expect(getAttendanceStatus(halfDay.checkIn, halfDay.checkOut)).toBe('Half Day');
    expect(getAttendanceStatus(null, null)).toBe('Absent');
  });
}); 