import { parseSubmissionId } from '@/lib/submissions/ids';

describe('parseSubmissionId', () => {
  it('accepts positive whole numbers', () => {
    expect(parseSubmissionId('12')).toBe(12);
    expect(parseSubmissionId('101')).toBe(101);
  });

  it.each(['abc', '0', '-3', '007', '1.5', '12abc', '', '99999999999999999999'])(
    'rejects %p, so the page 404s without calling the API',
    (value) => {
      expect(parseSubmissionId(value)).toBeNull();
    },
  );
});
