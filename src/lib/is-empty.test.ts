import {describe, expect, test} from 'vitest';
import {isEmpty} from './is-empty';

describe('isEmpty', () => {
  test.each([
    {val: '', expected: true},
    {val: ['1'], expected: false},
    {val: [], expected: true},
    {val: {}, expected: true},
    {val: {a: '1'}, expected: false},
    {val: 1, expected: false},
    {val: null, expected: true},
  ])('isEmpty($val) -> $expected', ({val, expected}) => {
    expect(isEmpty(val)).toBe(expected);
  });
});
