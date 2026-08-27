import type { Category, Product, SortOption } from '../types';

export const SEARCH_DEBOUNCE_MS = 380;

export function tokenizeQuery(query: string): string[] {
  return query.trim().toLocaleLowerCase('en-CA').split(/\s+/).filter(Boolean);
}

function normalize(value: string): string {
  return value.toLocaleLowerCase('en-CA');
}

export function productMatchesQuery(product: Product, query: string): boolean {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) return true;
  const haystack = normalize(`${product.name} ${product.description} ${product.category}`);
  return tokens.every((token) => haystack.includes(token));
}

export function scoreProductMatch(product: Product, query: string): number {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) return 0;

  const name = normalize(product.name);
  const description = normalize(product.description);
  const category = normalize(product.category);
  const joined = tokens.join(' ');
  let score = 0;

  if (name === joined) score += 400;
  if (name.startsWith(joined)) score += 200;
  if (tokens.every((token) => name.includes(token))) score += 120;
  if (name.includes(joined)) score += 40;
  if (tokens.every((token) => category.includes(token))) score += 60;
  if (tokens.every((token) => description.includes(token))) score += 30;

  return score - product.featuredOrder;
}

export function searchProducts(products: Product[], query: string): Product[] {
  if (!tokenizeQuery(query).length) return [];
  return products
    .filter((product) => productMatchesQuery(product, query))
    .sort((a, b) => scoreProductMatch(b, query) - scoreProductMatch(a, query));
}

export function highlightSegments(text: string, query: string): Array<{ value: string; match: boolean }> {
  const tokens = [...new Set(tokenizeQuery(query))].sort((a, b) => b.length - a.length);
  if (!tokens.length) return [{ value: text, match: false }];

  const lower = normalize(text);
  const marks = Array.from({ length: text.length }, () => false);

  for (const token of tokens) {
    let from = 0;
    while (from < lower.length) {
      const index = lower.indexOf(token, from);
      if (index < 0) break;
      for (let offset = 0; offset < token.length; offset += 1) marks[index + offset] = true;
      from = index + token.length;
    }
  }

  const segments: Array<{ value: string; match: boolean }> = [];
  for (let index = 0; index < text.length; index += 1) {
    const match = marks[index];
    const last = segments.at(-1);
    if (last && last.match === match) last.value += text[index];
    else segments.push({ value: text[index], match });
  }
  return segments;
}

export function filterAndSortProducts(
  products: Product[],
  query: string,
  category: Category | 'All',
  sort: SortOption,
): Product[] {
  const filtered = products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    return matchesCategory && productMatchesQuery(product, query);
  });

  return [...filtered].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'en-CA');
    if (sort === 'price-low') return a.priceCents - b.priceCents;
    if (sort === 'price-high') return b.priceCents - a.priceCents;
    return a.featuredOrder - b.featuredOrder;
  });
}
