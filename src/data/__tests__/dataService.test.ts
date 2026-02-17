import { describe, it, expect } from 'vitest';
import {
  calculateMetrics,
  getAgentMetrics,
  getDailyMetrics,
  filterReviewsByDate,
  filterReviewsByDepartments,
  filterReviewsByAgents,
  getDateRanges,
  Review,
  Agent,
  Department,
  DateRange,
} from '../dataService';

// ───── Test Fixtures ─────

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: 'r1',
    ext_review_id: 'ext-r1',
    agent_id: 'agent_a',
    department_id: 'dept-1',
    rating: 5,
    comment: '',
    review_ts: '2025-06-15T12:00:00Z',
    source: 'website',
    ...overrides,
  };
}

const AGENTS: Agent[] = [
  { id: 'agent_a', agent_key: 'agent_a', display_name: 'Alice', department_id: 'dept-1' },
  { id: 'agent_b', agent_key: 'agent_b', display_name: 'Bob', department_id: 'dept-2' },
];

const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Sales' },
  { id: 'dept-2', name: 'Support' },
];

// ───── SECTION A: calculateMetrics ─────

describe('calculateMetrics', () => {
  it('returns zeroes for empty input', () => {
    const m = calculateMetrics([]);
    expect(m).toEqual({
      star_1: 0, star_2: 0, star_3: 0, star_4: 0, star_5: 0,
      total: 0, avg_rating: 0, percent_5_star: 0,
    });
  });

  it('baseline: single 5-star review', () => {
    const m = calculateMetrics([makeReview({ rating: 5 })]);
    expect(m.total).toBe(1);
    expect(m.star_5).toBe(1);
    expect(m.avg_rating).toBe(5);
    expect(m.percent_5_star).toBe(100);
  });

  it('baseline: two reviews [5, 3]', () => {
    const m = calculateMetrics([
      makeReview({ id: 'r1', rating: 5 }),
      makeReview({ id: 'r2', rating: 3 }),
    ]);
    expect(m.total).toBe(2);
    expect(m.star_5).toBe(1);
    expect(m.star_3).toBe(1);
    expect(m.avg_rating).toBe(4); // (5+3)/2 = 4.00
    expect(m.percent_5_star).toBe(50); // 1/2 * 100 = 50.00
  });

  it('complex case: 10 reviews with all star ratings', () => {
    // 2x1-star, 1x2-star, 1x3-star, 2x4-star, 4x5-star
    const reviews = [
      makeReview({ id: 'r1', rating: 1 }),
      makeReview({ id: 'r2', rating: 1 }),
      makeReview({ id: 'r3', rating: 2 }),
      makeReview({ id: 'r4', rating: 3 }),
      makeReview({ id: 'r5', rating: 4 }),
      makeReview({ id: 'r6', rating: 4 }),
      makeReview({ id: 'r7', rating: 5 }),
      makeReview({ id: 'r8', rating: 5 }),
      makeReview({ id: 'r9', rating: 5 }),
      makeReview({ id: 'r10', rating: 5 }),
    ];
    const m = calculateMetrics(reviews);
    expect(m.total).toBe(10);
    expect(m.star_1).toBe(2);
    expect(m.star_2).toBe(1);
    expect(m.star_3).toBe(1);
    expect(m.star_4).toBe(2);
    expect(m.star_5).toBe(4);
    // avg = (2*1 + 1*2 + 1*3 + 2*4 + 4*5) / 10 = (2+2+3+8+20)/10 = 35/10 = 3.50
    expect(m.avg_rating).toBe(3.5);
    // percent_5 = 4/10 * 100 = 40.00
    expect(m.percent_5_star).toBe(40);
  });

  it('filters out invalid ratings (0, 6, negative)', () => {
    const reviews = [
      makeReview({ id: 'r1', rating: 0 }),
      makeReview({ id: 'r2', rating: 6 }),
      makeReview({ id: 'r3', rating: -1 }),
      makeReview({ id: 'r4', rating: 5 }),
    ];
    const m = calculateMetrics(reviews);
    expect(m.total).toBe(1);
    expect(m.star_5).toBe(1);
    expect(m.avg_rating).toBe(5);
  });

  it('rounds avg_rating to 2 decimal places', () => {
    // 1 + 2 + 5 = 8 / 3 = 2.666...  → 2.67
    const reviews = [
      makeReview({ id: 'r1', rating: 1 }),
      makeReview({ id: 'r2', rating: 2 }),
      makeReview({ id: 'r3', rating: 5 }),
    ];
    const m = calculateMetrics(reviews);
    expect(m.avg_rating).toBe(2.67);
  });

  it('rounds percent_5_star to 2 decimal places', () => {
    // 1 five-star out of 3 = 33.333... → 33.33
    const reviews = [
      makeReview({ id: 'r1', rating: 5 }),
      makeReview({ id: 'r2', rating: 4 }),
      makeReview({ id: 'r3', rating: 3 }),
    ];
    const m = calculateMetrics(reviews);
    expect(m.percent_5_star).toBe(33.33);
  });

  it('handles large numbers without overflow', () => {
    const reviews = Array.from({ length: 100000 }, (_, i) =>
      makeReview({ id: `r${i}`, rating: (i % 5) + 1 })
    );
    const m = calculateMetrics(reviews);
    expect(m.total).toBe(100000);
    // Each rating 1-5 appears 20000 times
    expect(m.star_1).toBe(20000);
    expect(m.star_5).toBe(20000);
    // avg = (20000*1 + 20000*2 + 20000*3 + 20000*4 + 20000*5) / 100000 = 300000/100000 = 3.0
    expect(m.avg_rating).toBe(3);
    // percent_5 = 20000/100000 * 100 = 20
    expect(m.percent_5_star).toBe(20);
  });
});

// ───── SECTION B: getDailyMetrics ─────

describe('getDailyMetrics', () => {
  const dateRange: DateRange = {
    from: new Date('2025-06-14T00:00:00Z'),
    to: new Date('2025-06-17T00:00:00Z'),
    label: 'test',
  };

  it('creates entries for all days in range, even with no reviews', () => {
    const result = getDailyMetrics([], dateRange);
    expect(result.length).toBe(3); // June 14, 15, 16
    result.forEach(day => {
      expect(day.total).toBe(0);
      expect(day.avg_rating).toBe(0);
      expect(day.percent_5_star).toBe(0);
    });
  });

  it('correctly aggregates reviews by date', () => {
    const reviews = [
      makeReview({ id: 'r1', rating: 5, review_ts: '2025-06-15T10:00:00Z' }),
      makeReview({ id: 'r2', rating: 3, review_ts: '2025-06-15T14:00:00Z' }),
      makeReview({ id: 'r3', rating: 5, review_ts: '2025-06-16T08:00:00Z' }),
    ];
    const result = getDailyMetrics(reviews, dateRange);

    // June 14: no reviews
    const june14 = result.find(d => d.date === '2025-06-14');
    expect(june14?.total).toBe(0);

    // June 15: 2 reviews (5 + 3)
    const june15 = result.find(d => d.date === '2025-06-15');
    expect(june15?.total).toBe(2);
    expect(june15?.star_5).toBe(1);
    expect(june15?.star_3).toBe(1);
    // avg = (5+3)/2 = 4.00
    expect(june15?.avg_rating).toBe(4);
    // percent_5 = 1/2 * 100 = 50.00
    expect(june15?.percent_5_star).toBe(50);

    // June 16: 1 review (5)
    const june16 = result.find(d => d.date === '2025-06-16');
    expect(june16?.total).toBe(1);
    expect(june16?.avg_rating).toBe(5);
    expect(june16?.percent_5_star).toBe(100);
  });

  it('percent_5_star is a percentage (0-100), not a fraction', () => {
    // This is the key regression test: percent_5_star must be in the range [0, 100]
    const reviews = [
      makeReview({ id: 'r1', rating: 5, review_ts: '2025-06-15T10:00:00Z' }),
      makeReview({ id: 'r2', rating: 5, review_ts: '2025-06-15T14:00:00Z' }),
      makeReview({ id: 'r3', rating: 4, review_ts: '2025-06-15T16:00:00Z' }),
    ];
    const result = getDailyMetrics(reviews, dateRange);
    const june15 = result.find(d => d.date === '2025-06-15');
    // 2 out of 3 are 5-star = 66.67%
    expect(june15?.percent_5_star).toBe(66.67);
    // MUST NOT be 6666.67 (double-multiply bug) or 0.67 (forgot * 100)
    expect(june15!.percent_5_star).toBeGreaterThanOrEqual(0);
    expect(june15!.percent_5_star).toBeLessThanOrEqual(100);
  });
});

// ───── SECTION C: getAgentMetrics ─────

describe('getAgentMetrics', () => {
  it('groups reviews by agent and calculates metrics', () => {
    const reviews = [
      makeReview({ id: 'r1', agent_id: 'agent_a', rating: 5 }),
      makeReview({ id: 'r2', agent_id: 'agent_a', rating: 4 }),
      makeReview({ id: 'r3', agent_id: 'agent_b', rating: 3 }),
    ];
    const result = getAgentMetrics(reviews, AGENTS, DEPARTMENTS);

    expect(result.length).toBe(2);

    // Agent A has 2 reviews (sorted first because higher total)
    const agentA = result.find(a => a.agent_id === 'agent_a');
    expect(agentA?.total).toBe(2);
    expect(agentA?.avg_rating).toBe(4.5);
    expect(agentA?.agent_name).toBe('Alice');
    expect(agentA?.department_name).toBe('Sales');

    // Agent B has 1 review
    const agentB = result.find(a => a.agent_id === 'agent_b');
    expect(agentB?.total).toBe(1);
    expect(agentB?.avg_rating).toBe(3);
  });

  it('sorts agents by total reviews descending', () => {
    const reviews = [
      makeReview({ id: 'r1', agent_id: 'agent_b', rating: 5 }),
      makeReview({ id: 'r2', agent_id: 'agent_b', rating: 5 }),
      makeReview({ id: 'r3', agent_id: 'agent_b', rating: 5 }),
      makeReview({ id: 'r4', agent_id: 'agent_a', rating: 5 }),
    ];
    const result = getAgentMetrics(reviews, AGENTS, DEPARTMENTS);
    expect(result[0].agent_id).toBe('agent_b');
    expect(result[0].total).toBe(3);
    expect(result[1].agent_id).toBe('agent_a');
    expect(result[1].total).toBe(1);
  });
});

// ───── SECTION D: Filtering ─────

describe('filterReviewsByDate', () => {
  const range: DateRange = {
    from: new Date('2025-06-14T00:00:00Z'),
    to: new Date('2025-06-16T00:00:00Z'),
  };

  it('includes reviews within range (inclusive start, exclusive end)', () => {
    const reviews = [
      makeReview({ id: 'r1', review_ts: '2025-06-13T23:59:59Z' }), // before
      makeReview({ id: 'r2', review_ts: '2025-06-14T00:00:00Z' }), // at start (included)
      makeReview({ id: 'r3', review_ts: '2025-06-15T12:00:00Z' }), // middle
      makeReview({ id: 'r4', review_ts: '2025-06-16T00:00:00Z' }), // at end (excluded)
      makeReview({ id: 'r5', review_ts: '2025-06-17T00:00:00Z' }), // after
    ];
    const result = filterReviewsByDate(reviews, range);
    expect(result.map(r => r.id)).toEqual(['r2', 'r3']);
  });
});

describe('filterReviewsByDepartments', () => {
  it('returns all reviews when empty department filter', () => {
    const reviews = [makeReview()];
    expect(filterReviewsByDepartments(reviews, []).length).toBe(1);
  });

  it('filters by department_id', () => {
    const reviews = [
      makeReview({ id: 'r1', department_id: 'dept-1' }),
      makeReview({ id: 'r2', department_id: 'dept-2' }),
    ];
    const result = filterReviewsByDepartments(reviews, ['dept-1']);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('r1');
  });
});

describe('filterReviewsByAgents', () => {
  it('returns all reviews when empty agent filter', () => {
    const reviews = [makeReview()];
    expect(filterReviewsByAgents(reviews, []).length).toBe(1);
  });

  it('filters by agent_id', () => {
    const reviews = [
      makeReview({ id: 'r1', agent_id: 'agent_a' }),
      makeReview({ id: 'r2', agent_id: 'agent_b' }),
    ];
    const result = filterReviewsByAgents(reviews, ['agent_b']);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('r2');
  });
});

// ───── SECTION E: Golden Snapshot ─────

describe('golden snapshot: fixed input produces exact output', () => {
  const GOLDEN_REVIEWS: Review[] = [
    { id: 'g1', ext_review_id: 'g1', agent_id: 'agent_a', department_id: 'dept-1', rating: 5, comment: '', review_ts: '2025-06-15T10:00:00Z', source: 'website' },
    { id: 'g2', ext_review_id: 'g2', agent_id: 'agent_a', department_id: 'dept-1', rating: 5, comment: '', review_ts: '2025-06-15T11:00:00Z', source: 'website' },
    { id: 'g3', ext_review_id: 'g3', agent_id: 'agent_a', department_id: 'dept-1', rating: 4, comment: '', review_ts: '2025-06-15T12:00:00Z', source: 'google' },
    { id: 'g4', ext_review_id: 'g4', agent_id: 'agent_b', department_id: 'dept-2', rating: 3, comment: '', review_ts: '2025-06-15T13:00:00Z', source: 'google' },
    { id: 'g5', ext_review_id: 'g5', agent_id: 'agent_b', department_id: 'dept-2', rating: 1, comment: '', review_ts: '2025-06-16T09:00:00Z', source: 'website' },
    { id: 'g6', ext_review_id: 'g6', agent_id: 'agent_a', department_id: 'dept-1', rating: 5, comment: '', review_ts: '2025-06-16T10:00:00Z', source: 'website' },
    { id: 'g7', ext_review_id: 'g7', agent_id: 'agent_b', department_id: 'dept-2', rating: 2, comment: '', review_ts: '2025-06-16T11:00:00Z', source: 'google' },
    { id: 'g8', ext_review_id: 'g8', agent_id: 'agent_a', department_id: 'dept-1', rating: 4, comment: '', review_ts: '2025-06-16T14:00:00Z', source: 'website' },
  ];

  it('calculateMetrics produces exact expected output', () => {
    const m = calculateMetrics(GOLDEN_REVIEWS);
    // Hand-calculated:
    // star_1=1, star_2=1, star_3=1, star_4=2, star_5=3, total=8
    // avg = (1+2+3+4+4+5+5+5)/8 = 29/8 = 3.625 → rounded 3.63
    // percent_5 = 3/8 * 100 = 37.5
    expect(m).toEqual({
      star_1: 1,
      star_2: 1,
      star_3: 1,
      star_4: 2,
      star_5: 3,
      total: 8,
      avg_rating: 3.63,
      percent_5_star: 37.5,
    });
  });

  it('getAgentMetrics produces correct per-agent breakdown', () => {
    const agents = getAgentMetrics(GOLDEN_REVIEWS, AGENTS, DEPARTMENTS);
    // Agent A: reviews g1(5), g2(5), g3(4), g6(5), g8(4) → total=5, avg=(5+5+4+5+4)/5=23/5=4.6, 5star=3/5=60%
    const agentA = agents.find(a => a.agent_id === 'agent_a')!;
    expect(agentA.total).toBe(5);
    expect(agentA.avg_rating).toBe(4.6);
    expect(agentA.percent_5_star).toBe(60);

    // Agent B: reviews g4(3), g5(1), g7(2) → total=3, avg=(3+1+2)/3=6/3=2.0, 5star=0/3=0%
    const agentB = agents.find(a => a.agent_id === 'agent_b')!;
    expect(agentB.total).toBe(3);
    expect(agentB.avg_rating).toBe(2);
    expect(agentB.percent_5_star).toBe(0);
  });

  it('getDailyMetrics produces correct daily breakdown', () => {
    const range: DateRange = {
      from: new Date('2025-06-15T00:00:00Z'),
      to: new Date('2025-06-17T00:00:00Z'),
    };
    const daily = getDailyMetrics(GOLDEN_REVIEWS, range);

    // June 15: g1(5), g2(5), g3(4), g4(3) → total=4, avg=(5+5+4+3)/4=17/4=4.25, 5star=2/4=50%
    const d15 = daily.find(d => d.date === '2025-06-15')!;
    expect(d15.total).toBe(4);
    expect(d15.avg_rating).toBe(4.25);
    expect(d15.percent_5_star).toBe(50);

    // June 16: g5(1), g6(5), g7(2), g8(4) → total=4, avg=(1+5+2+4)/4=12/4=3.0, 5star=1/4=25%
    const d16 = daily.find(d => d.date === '2025-06-16')!;
    expect(d16.total).toBe(4);
    expect(d16.avg_rating).toBe(3);
    expect(d16.percent_5_star).toBe(25);
  });
});

// ───── SECTION F: Edge Cases ─────

describe('edge cases', () => {
  it('all reviews same rating (all 5s)', () => {
    const reviews = Array.from({ length: 5 }, (_, i) =>
      makeReview({ id: `r${i}`, rating: 5 })
    );
    const m = calculateMetrics(reviews);
    expect(m.avg_rating).toBe(5);
    expect(m.percent_5_star).toBe(100);
  });

  it('all reviews rating 1', () => {
    const reviews = Array.from({ length: 5 }, (_, i) =>
      makeReview({ id: `r${i}`, rating: 1 })
    );
    const m = calculateMetrics(reviews);
    expect(m.avg_rating).toBe(1);
    expect(m.percent_5_star).toBe(0);
  });

  it('single review of each rating', () => {
    const reviews = [1, 2, 3, 4, 5].map((r, i) =>
      makeReview({ id: `r${i}`, rating: r })
    );
    const m = calculateMetrics(reviews);
    expect(m.total).toBe(5);
    expect(m.avg_rating).toBe(3);
    expect(m.percent_5_star).toBe(20);
  });

  it('decimal ratings are handled (even if unexpected)', () => {
    // Ratings should be integers 1-5, but test robustness
    const reviews = [
      makeReview({ id: 'r1', rating: 4.5 as any }), // will be filtered as 4.5 >= 1 && 4.5 <= 5
    ];
    const m = calculateMetrics(reviews);
    // Should still handle gracefully
    expect(m.total).toBe(1);
    expect(m.avg_rating).toBe(4.5);
  });
});

// ───── SECTION G: getDateRanges ─────

describe('getDateRanges', () => {
  it('all ranges have from < to', () => {
    const ranges = getDateRanges();
    Object.values(ranges).forEach(range => {
      expect(range.from.getTime()).toBeLessThan(range.to.getTime());
    });
  });

  it('thisMonth starts on the 1st of the current month', () => {
    const ranges = getDateRanges();
    expect(ranges.thisMonth.from.getDate()).toBe(1);
  });
});
