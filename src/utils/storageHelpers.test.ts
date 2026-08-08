import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStorageItem, setStorageItem, removeStorageItem } from './storageHelpers';

describe('Storage Helpers - Unhappy Paths & Security Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retrieves and parses valid stored data', () => {
    localStorage.setItem('test_key', JSON.stringify({ name: 'Salt', qty: 2 }));
    const result = getStorageItem('test_key', { name: '', qty: 0 });
    expect(result).toEqual({ name: 'Salt', qty: 2 });
  });

  it('returns default value when key does not exist in localStorage', () => {
    const result = getStorageItem('non_existent', ['default_item']);
    expect(result).toEqual(['default_item']);
  });

  it('catches invalid/corrupted JSON and safely returns default value without throwing', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('corrupted_key', '{ invalid json syntax: ');

    const result = getStorageItem('corrupted_key', { fallback: true });

    expect(result).toEqual({ fallback: true });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[StorageHelper] Failed to parse key "corrupted_key"'),
      expect.any(SyntaxError)
    );
  });

  it('handles localStorage.getItem security or access exceptions gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Permission denied / Cookies disabled', 'SecurityError');
    });

    const result = getStorageItem('protected_key', 'fallback_value');

    expect(result).toBe('fallback_value');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('handles QuotaExceededError when saving large items to localStorage', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError: The quota has been exceeded.', 'QuotaExceededError');
    });

    const success = setStorageItem('large_payload', { data: 'a'.repeat(10000) });

    expect(success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[StorageHelper] Failed to set key "large_payload"'),
      expect.any(DOMException)
    );
  });

  it('handles exceptions in removeStorageItem gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    expect(() => removeStorageItem('test_key')).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
  });
});
