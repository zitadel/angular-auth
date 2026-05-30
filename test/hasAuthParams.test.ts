import { describe, expect, it } from '@jest/globals';
import { hasAuthParams } from '../src/lib/utils.js';

const loc = (search: string, hash: string): Location =>
  ({ search, hash }) as Location;

describe('hasAuthParams', () => {
  it('should detect code + state in the query string', () => {
    expect(hasAuthParams(loc('?code=abc&state=xyz', ''))).toBe(true);
  });

  it('should detect error + state in the query string', () => {
    expect(hasAuthParams(loc('?error=access_denied&state=xyz', ''))).toBe(true);
  });

  it('should detect code + state in the fragment', () => {
    expect(hasAuthParams(loc('', '#code=abc&state=xyz'))).toBe(true);
  });

  it('should return false without a state parameter', () => {
    expect(hasAuthParams(loc('?code=abc', ''))).toBe(false);
  });

  it('should return false for an unrelated URL', () => {
    expect(hasAuthParams(loc('?foo=bar&baz=qux', ''))).toBe(false);
  });
});
