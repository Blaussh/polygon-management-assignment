import React, { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { usePolygons } from './usePolygons';

// Mock the API service
const mockGetPolygons = vi.fn();
vi.mock('@/services/api', () => ({
  apiService: {
    getPolygons: mockGetPolygons,
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

describe('usePolygons Hook (Simple)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start in loading state', () => {
    mockGetPolygons.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => usePolygons(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch polygons successfully', async () => {
    const mockPolygons = [
      {
        id: 1,
        name: 'Triangle',
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 150, y: 50 },
        ],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    ];

    mockGetPolygons.mockResolvedValue(mockPolygons);

    const { result } = renderHook(() => usePolygons(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPolygons);
    expect(mockGetPolygons).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch polygons';
    mockGetPolygons.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePolygons(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(mockGetPolygons).toHaveBeenCalledTimes(1);
  });
});
