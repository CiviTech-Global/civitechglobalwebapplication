import { describe, it, expect } from 'vitest';
import { productListQuerySchema } from './product.schema.js';

describe('productListQuerySchema', () => {
  it('accepts pagination with category and search', () => {
    const result = productListQuerySchema.parse({ page: '2', limit: '20', category: 'AI', search: 'jarvis' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(20);
    expect(result.category).toBe('AI');
    expect(result.search).toBe('jarvis');
  });

  it('trims search and category', () => {
    const result = productListQuerySchema.parse({ category: '  AI  ', search: '  jarvis  ' });
    expect(result.category).toBe('AI');
    expect(result.search).toBe('jarvis');
  });

  it('handles repeated query params', () => {
    const result = productListQuerySchema.parse({ category: ['AI', 'HR'], search: ['jarvis', 'trade'] });
    expect(result.category).toBe('AI');
    expect(result.search).toBe('jarvis');
  });
});
