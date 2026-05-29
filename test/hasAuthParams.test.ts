import { describe, expect, it } from '@jest/globals';
import { hasAuthParams } from '../src/lib/utils.js';

describe('hasAuthParams', () => {
  it('should detect code + state in the query string', () => {
    expect(hasAuthParams('?code=abc&state=xyz')).toBe(true);
  });

  it('should detect error + state in the query string', () => {
    expect(hasAuthParams('?error=access_denied&state=xyz')).toBe(true);
  });

  it('should detect code + state in the fragment', () => {
    // Angular's `hasAuthParams` takes a query string / URLSearchParams rather
    // than parsing the location itself, so the fragment's params are passed in
    // directly to keep the assertion meaningful.
    const fragmentParams = new URLSearchParams('code=abc&state=xyz');
    expect(hasAuthParams(fragmentParams)).toBe(true);
  });

  it('should return false without a state parameter', () => {
    expect(hasAuthParams('?code=abc')).toBe(false);
  });

  it('should return false for an unrelated URL', () => {
    expect(hasAuthParams('?foo=bar&baz=qux')).toBe(false);
    expect(hasAuthParams('')).toBe(false);
    expect(hasAuthParams()).toBe(false);
  });
});
