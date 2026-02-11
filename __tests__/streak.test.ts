// __tests__/streak.test.ts

describe('Streak Logic Calculation', () => {
  const calculateStreak = (lastLoggedDate: string | null, today: string) => {
    if (!lastLoggedDate) return 1;
    if (lastLoggedDate === today) return 'current'; // No change

    const last = new Date(lastLoggedDate);
    const current = new Date(today);
    
    const diffTime = Math.abs(current.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 1) return 'increment';
    if (diffDays > 1) return 'reset';
    return 'error';
  };

  test('should return 1 for new user (no last log)', () => {
    expect(calculateStreak(null, '2025-02-11')).toBe(1);
  });

  test('should return "increment" if logged yesterday', () => {
    expect(calculateStreak('2025-02-10', '2025-02-11')).toBe('increment');
  });

  test('should return "current" if already logged today', () => {
    expect(calculateStreak('2025-02-11', '2025-02-11')).toBe('current');
  });

  test('should return "reset" if missed a day', () => {
    expect(calculateStreak('2025-02-09', '2025-02-11')).toBe('reset');
  });
});
