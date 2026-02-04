describe('Email validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  it('rejects empty email', () => {
    expect(emailRegex.test('')).toBe(false);
  });

  it('rejects email without @', () => {
    expect(emailRegex.test('testexample.com')).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(emailRegex.test('test@')).toBe(false);
  });

  it('rejects email without TLD', () => {
    expect(emailRegex.test('test@example')).toBe(false);
  });

  it('rejects email with spaces', () => {
    expect(emailRegex.test('test @example.com')).toBe(false);
  });

  it('accepts valid email', () => {
    expect(emailRegex.test('test@example.com')).toBe(true);
  });

  it('accepts email with subdomain', () => {
    expect(emailRegex.test('test@sub.example.com')).toBe(true);
  });

  it('accepts email with plus tag', () => {
    expect(emailRegex.test('test+tag@example.com')).toBe(true);
  });
});
