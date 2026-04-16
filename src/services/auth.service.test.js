import { describe, it, expect, vi } from 'vitest';
import authService from './auth.service';
import api from './api';

vi.mock('./api');

describe('authService', () => {
  it('should call login endpoint correctly', async () => {
    const mockData = { token: '12345', user: { id: 1 } };
    api.post.mockResolvedValueOnce({ data: mockData });

    const result = await authService.login('test@test.com', 'password123');

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'password123'
    });
    expect(result).toEqual(mockData);
  });

  it('should call register endpoint correctly', async () => {
    const mockData = { id: 2, name: 'John' };
    api.post.mockResolvedValueOnce({ data: mockData });

    const result = await authService.register('John', 'john@test.com', 'pwd');

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'John',
      email: 'john@test.com',
      password: 'pwd'
    });
    expect(result).toEqual(mockData);
  });

  it('should call getMe endpoint correctly', async () => {
    const mockData = { id: 1, name: 'User' };
    api.get.mockResolvedValueOnce({ data: mockData });

    const result = await authService.getMe();

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockData);
  });
});
