/**
 * Token Storage Abstraction
 * Handles safe retrieval, persistence, and invalidation of the JWT token.
 * Uses localStorage with in-memory fallback.
 */

const TOKEN_KEY = 'tokomakanan_auth_token';

let inMemoryToken: string | null = null;

export const tokenStorage = {
  getToken(): string | null {
    if (inMemoryToken) {
      return inMemoryToken;
    }
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      inMemoryToken = stored;
      return stored;
    } catch {
      return inMemoryToken;
    }
  },

  setToken(token: string): void {
    inMemoryToken = token;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // In-memory fallback is already set
    }
  },

  removeToken(): void {
    inMemoryToken = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore storage error on cleanup
    }
  },

  hasToken(): boolean {
    return Boolean(this.getToken());
  },
};
