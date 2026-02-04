jest.mock('../../services/auth', () => ({
  getSession: jest.fn(),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('../../services/revenuecat', () => ({
  identifyUser: jest.fn(),
  logOutUser: jest.fn(),
}));

import { useAuthStore } from '../../store/authStore';
import * as auth from '../../services/auth';
import * as revenuecat from '../../services/revenuecat';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  emailVerified: true,
  createdAt: '2024-01-01',
};

beforeEach(() => {
  useAuthStore.setState({
    isInitialized: false,
    isLoading: false,
    isAuthenticated: false,
    user: null,
    error: null,
  });
  jest.clearAllMocks();
});

describe('authStore', () => {
  describe('initialize', () => {
    it('sets user when session exists', async () => {
      (auth.getSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token' },
      });
      (revenuecat.identifyUser as jest.Mock).mockResolvedValue({});

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isInitialized).toBe(true);
    });

    it('sets unauthenticated when no session', async () => {
      (auth.getSession as jest.Mock).mockResolvedValue(null);

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isInitialized).toBe(true);
    });
  });

  describe('signInWithEmail', () => {
    it('returns true and sets user on success', async () => {
      (auth.signInWithEmail as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
      });
      (revenuecat.identifyUser as jest.Mock).mockResolvedValue({});

      const result = await useAuthStore.getState().signInWithEmail('test@example.com', 'password');

      expect(result).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('returns false and sets error on failure', async () => {
      (auth.signInWithEmail as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const result = await useAuthStore.getState().signInWithEmail('test@example.com', 'wrong');

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('clears user state', async () => {
      useAuthStore.setState({ isAuthenticated: true, user: mockUser });
      (auth.signOut as jest.Mock).mockResolvedValue(undefined);
      (revenuecat.logOutUser as jest.Mock).mockResolvedValue({});

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
