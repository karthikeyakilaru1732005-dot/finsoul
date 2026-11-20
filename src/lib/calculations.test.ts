import { describe, expect, it } from 'vitest';
import { ALL_CALCULATORS } from './calculations';

const calculator = (id: string) => {
  const found = ALL_CALCULATORS.find((item) => item.id === id);
  if (!found) throw new Error(`Missing calculator: ${id}`);
  return found;
};

describe('toolkit calculator edge cases', () => {
  it('counts the complete toolkit from its actual calculator data', () => {
    expect(ALL_CALCULATORS).toHaveLength(26);
  });

  it('discounts NPV cash flows including the initial outlay exactly once', () => {
    const result = calculator('npv').run({ r: '10', cf: '-100000, 60000, 60000' });
    expect(result.error).toBeUndefined();
    expect(result.interpretation).toContain('positive');
    expect(result.steps[0]).toContain('initial outflow is CF₀');
  });

  it('reports an unsolvable IRR rather than inventing a rate', () => {
    const result = calculator('irr').run({ cf: '-100000, -50000' });
    expect(result.error).toContain('positive cash flow');
  });

  it('handles an interest-free loan without dividing by zero', () => {
    const result = calculator('emi').run({ p: '120000', r: '0', n: '10' });
    expect(result.error).toBeUndefined();
    expect(result.headline).toContain('1,000.00');
  });
});
