import { getSuggestions } from '../src/suggestions';

describe('suggestions fallback', () => {
  it('returns deterministic local suggestions', async () => {
    const result = await getSuggestions(['A', 'B', 'C'], 'Market');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns farm-specific suggestions', async () => {
    const result = await getSuggestions(['A', 'B', 'C'], 'Farm Shop');
    expect(result).toContain('Apples');
  });
});
