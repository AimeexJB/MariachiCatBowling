import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreShot, nextStreak, captchaAccepts, powerAt, difficulty, rollConditions, describeOil, simulateRoll, aimWobble } from './logic.js';

test('only a near-dead-center impact with power in the zone is a strike', () => {
  const zone = difficulty(0).zone;
  for (const impact of [-7, 0, 7]) for (const power of [zone[0], 0.72, zone[1]]) assert.equal(scoreShot(impact, power, zone), 10);
  for (const [impact, power] of [[8, 0.72], [-8, 0.72], [0, zone[0] - 0.01], [0, zone[1] + 0.01], [40, 0.72]])
    assert.ok(scoreShot(impact, power, zone) < 10);
});

test('gutter and barely released shots miss all pins', () => {
  assert.equal(scoreShot(100, 0.7), 0);
  assert.equal(scoreShot(-96, 0.7), 0);
  assert.equal(scoreShot(0, 0.1), 0);
});

test('each strike in a row makes the next one harder', () => {
  const [a, b, c] = [0, 1, 2].map(difficulty);
  assert.ok(b.zone[1] - b.zone[0] < a.zone[1] - a.zone[0] && c.zone[1] - c.zone[0] < b.zone[1] - b.zone[0]);
  assert.ok(a.wobble < b.wobble && b.wobble < c.wobble);
  assert.ok(a.period > b.period && b.period > c.period);
  assert.deepEqual(difficulty(9), c);
});

test('the ball curves by the announced amount and must be compensated for', () => {
  assert.equal(simulateRoll(0, 30, 0).impact, 30);
  assert.equal(simulateRoll(-30, 30, 0).impact, 0);
  assert.equal(simulateRoll(-30, 30, 10).impact, 10);
  const gutter = simulateRoll(90, 40, 0);
  assert.ok(gutter.gutterAt > 0 && gutter.gutterAt < 1);
  assert.equal(gutter.impact, 100);
});

test('lane oil arrows are within 5 of the real curve', () => {
  for (let r = 0; r < 1; r += 0.01) {
    const { curve } = rollConditions(() => r);
    const arrows = (describeOil(curve).match(/[←→]/g) || []).length;
    assert.ok(Math.abs(arrows * 10 - Math.abs(curve)) <= 5, `curve ${curve}`);
  }
  assert.deepEqual(rollConditions(() => 0.5), { curve: 0, chaos: 0 });
});

test('aim wobble stays within its amplitude', () => {
  for (let t = 0; t < 5000; t += 13) assert.ok(Math.abs(aimWobble(t, 9)) <= 9);
});

test('strikes add up to three and a miss keeps your progress', () => {
  assert.equal([10, 10, 10].reduce(nextStreak, 0), 3);
  assert.equal([10, 10, 9].reduce(nextStreak, 0), 2);
  assert.equal([10, 0, 10].reduce(nextStreak, 0), 2);
  assert.equal(nextStreak(3, 10), 3);
});

test('captcha rejects the first attempt, accepts randomly after, and always by attempt seven', () => {
  assert.equal(captchaAccepts(1, 0), false);
  assert.equal(captchaAccepts(2, 0.1), true);
  assert.equal(captchaAccepts(6, 0.9), false);
  assert.equal(captchaAccepts(7, 0.999), true);
});

test('power cycles continuously within bounds', () => {
  assert.equal(powerAt(0), 0);
  assert.equal(powerAt(Math.PI * 400, 400), 1);
  for (let t = 0; t < 10000; t += 17) assert.ok(powerAt(t) >= 0 && powerAt(t) <= 1);
});
