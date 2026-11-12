export const GOAL = 3;
export const STRIKE_WIDTH = 7;
const GUTTER = 100;

// Each consecutive strike tightens the power zone, speeds the meter, and shakes the aim more.
const LEVELS = [
  { zone: [0.6, 0.84], wobble: 5, period: 520 },
  { zone: [0.64, 0.8], wobble: 9, period: 430 },
  { zone: [0.68, 0.77], wobble: 13, period: 360 }
];

export function difficulty(streak) {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, streak))];
}

// Curve is announced to the player (rounded to arrows); chaos is a hidden extra nudge.
export function rollConditions(random = Math.random) {
  const r = random();
  const curve = Math.abs(r - 0.5) < 0.17 ? 0 : Math.round((r - 0.5) * 90);
  const chaos = random() < 0.15 ? Math.round((random() < 0.5 ? -1 : 1) * (8 + random() * 12)) : 0;
  return { curve, chaos };
}

export function describeOil(curve) {
  const arrows = Math.round(Math.abs(curve) / 10);
  if (!arrows) return 'LANE OIL: DRY. ROLLS STRAIGHT. ALLEGEDLY.';
  const right = curve > 0;
  return `LANE OIL: ${(right ? '→' : '←').repeat(arrows)} HOOKS ${right ? 'RIGHT' : 'LEFT'}`;
}

export function pathOffset(aim, curve, chaos, progress) {
  return aim + curve * progress ** 2 + chaos * progress ** 3;
}

export function simulateRoll(aim, curve, chaos, steps = 60) {
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps, offset = pathOffset(aim, curve, chaos, progress);
    if (Math.abs(offset) > GUTTER) return { impact: Math.sign(offset) * GUTTER, gutterAt: progress };
  }
  return { impact: pathOffset(aim, curve, chaos, 1), gutterAt: null };
}

export function scoreShot(impact, power, zone = LEVELS[0].zone) {
  const offset = Math.abs(impact);
  if (offset >= 95 || power < 0.12) return 0;
  if (offset <= STRIKE_WIDTH && power >= zone[0] && power <= zone[1]) return 10;
  const accuracy = Math.max(0, 1 - offset / 100);
  const force = power < zone[0] ? power / zone[0] : power > zone[1] ? Math.max(0.5, 1 - (power - zone[1]) * 2) : 1;
  return Math.min(9, Math.max(1, Math.round(accuracy * force * 10)));
}

export function nextStreak(streak, pins) {
  // A miss keeps the streak; the captcha is the price. Abandoning the captcha resets the run.
  return pins === 10 ? Math.min(GOAL, streak + 1) : streak;
}

// A parody, not a security mechanism. The hard cap prevents a soft lock.
export function captchaAccepts(attempt, random = Math.random()) {
  return attempt >= 7 || (attempt >= 2 && random < 0.28);
}

export function powerAt(elapsed, period = LEVELS[0].period) {
  return (1 - Math.cos(elapsed / period)) / 2;
}

export function aimWobble(elapsed, amount) {
  return amount * Math.sin(elapsed / 210);
}
