import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../data/catalog';
import {
  filterAndSortProducts,
  highlightSegments,
  searchProducts,
} from './catalog';

describe('filterAndSortProducts', () => {
  it('searches names, descriptions, and categories case-insensitively', () => {
    expect(filterAndSortProducts(PRODUCTS, 'APPLE', 'All', 'featured').map((item) => item.id)).toEqual([
      'honeycrisp-apples',
    ]);
    expect(filterAndSortProducts(PRODUCTS, 'airy', 'All', 'featured')[0]?.id).toBe('butter-croissants');
    expect(filterAndSortProducts(PRODUCTS, 'frozen', 'All', 'featured')).toHaveLength(2);
  });

  it('matches every token in a multi-word query', () => {
    expect(filterAndSortProducts(PRODUCTS, 'olive oil', 'All', 'featured').map((item) => item.id)).toEqual([
      'extra-virgin-olive-oil',
    ]);
    expect(filterAndSortProducts(PRODUCTS, 'olive milk', 'All', 'featured')).toHaveLength(0);
  });

  it('combines category filters with sorting', () => {
    const pantry = filterAndSortProducts(PRODUCTS, '', 'Pantry', 'price-high');
    expect(pantry.map((item) => item.id)).toEqual(['extra-virgin-olive-oil', 'rigatoni-pasta']);
  });

  it('preserves curated order for featured sorting', () => {
    expect(filterAndSortProducts(PRODUCTS, '', 'All', 'featured').map((item) => item.featuredOrder)).toEqual(
      [...PRODUCTS].map((item) => item.featuredOrder),
    );
  });
});

describe('searchProducts', () => {
  it('ranks name matches ahead of description or category hits', () => {
    expect(searchProducts(PRODUCTS, 'fresh').map((item) => item.id)).toEqual([
      'whole-milk',
      'atlantic-salmon',
    ]);
  });

  it('returns an empty list until the query has a token', () => {
    expect(searchProducts(PRODUCTS, '   ')).toEqual([]);
  });
});

describe('highlightSegments', () => {
  it('marks matching query tokens without changing surrounding text', () => {
    expect(highlightSegments('Honeycrisp Apples', 'apple')).toEqual([
      { value: 'Honeycrisp ', match: false },
      { value: 'Apple', match: true },
      { value: 's', match: false },
    ]);
  });
});

