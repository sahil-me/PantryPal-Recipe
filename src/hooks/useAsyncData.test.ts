import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAsyncData } from './useAsyncData';

describe('useAsyncData Hook - Unhappy Paths & Async Error Handling', () => {
  it('resolves data successfully and updates loading state', async () => {
    const fetcher = vi.fn().mockResolvedValue(['garlic', 'olive oil']);

    const { result } = renderHook(() => useAsyncData(fetcher));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(['garlic', 'olive oil']);
    expect(result.current.error).toBeNull();
  });

  it('handles network errors and rejects gracefully without crashing', async () => {
    const networkError = new Error('Network Connection Lost');
    const fetcher = vi.fn().mockRejectedValue(networkError);

    const { result } = renderHook(() => useAsyncData(fetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(networkError);
    expect(result.current.error?.message).toBe('Network Connection Lost');
  });

  it('handles non-Error thrown objects (e.g. raw string exception) safely', async () => {
    const fetcher = vi.fn().mockRejectedValue('Server Timeout 504');

    const { result } = renderHook(() => useAsyncData(fetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Server Timeout 504');
  });

  it('resets error state and sets loading during manual refetch', async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('First attempt failed'));
      }
      return Promise.resolve(['Success Data']);
    });

    const { result } = renderHook(() => useAsyncData(fetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error?.message).toBe('First attempt failed');

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(['Success Data']);
  });
});
