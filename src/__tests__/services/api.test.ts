const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { apiUrl: 'http://test-api.com' } },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ApiClient', () => {
  let api: any;

  beforeAll(async () => {
    const mod = await import('../../services/api');
    api = mod.api;
  });

  it('sends GET request with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: () => Promise.resolve({ success: true, data: { id: 1 } }),
    });

    const result = await api.get('/api/test');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.com/api/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({}),
      }),
    );
    expect(result.success).toBe(true);
  });

  it('sends POST request with JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: () => Promise.resolve({ success: true, data: { id: 1 } }),
    });

    await api.post('/api/test', { name: 'test' });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.com/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('includes auth token when set', async () => {
    api.setAuthToken('test-token-123');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: () => Promise.resolve({ success: true }),
    });

    await api.get('/api/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      }),
    );

    api.setAuthToken(null);
  });

  it('returns NETWORK_ERROR on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    const result = await api.get('/api/test');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('NETWORK_ERROR');
  });

  it('handles 204 empty response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: { get: () => '0' },
    });

    const result = await api.delete('/api/test/1');

    expect(result.success).toBe(true);
  });

  it('returns error for non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => null },
      json: () =>
        Promise.resolve({
          error: { code: 'VALIDATION_ERROR', message: 'Bad request' },
        }),
    });

    const result = await api.get('/api/test');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION_ERROR');
  });
});
