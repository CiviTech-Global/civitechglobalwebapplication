import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeObject } from './sanitize.js';

describe('Sanitize utils', () => {
  it('escapes HTML characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(escapeHtml("' OR 1=1 --")).toBe('&#x27; OR 1=1 --');
  });

  it('recursively sanitizes object values', () => {
    const input = {
      name: '<b>name</b>',
      tags: ['<script>', 'safe'],
      nested: {
        bio: '<img src=x onerror=alert(1)>',
      },
      count: 42,
      active: true,
      empty: null,
    };

    const result = sanitizeObject(input);
    expect(result.name).toBe('&lt;b&gt;name&lt;/b&gt;');
    expect(result.tags).toEqual(['&lt;script&gt;', 'safe']);
    expect(result.nested.bio).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
    expect(result.empty).toBeNull();
  });
});
