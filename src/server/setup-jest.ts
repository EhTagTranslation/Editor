import { toMatchOneOf, toMatchShapeOf } from 'jest-to-match-shape-of';
import { expect } from '@jest/globals';

expect.extend({
    toMatchOneOf,
    toMatchShapeOf,
});
