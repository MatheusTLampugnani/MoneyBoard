import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import api from './api';

describe('api service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use the environment variable for baseURL if provided', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:5000/api');
  });

  it('should add Authorization header if token exists in localStorage', async () => {
    localStorage.setItem('token', 'fake-jwt-token');

    // Simulate an interceptor request
    const config = { headers: {} };
    
    // The interceptors array can be accessed via handlers in axios
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    
    const resultingConfig = await requestInterceptor(config);
    expect(resultingConfig.headers.Authorization).toBe('Bearer fake-jwt-token');
  });

  it('should not add Authorization header if token does not exist', async () => {
    const config = { headers: {} };
    
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    
    const resultingConfig = await requestInterceptor(config);
    expect(resultingConfig.headers.Authorization).toBeUndefined();
  });
});
