# Spare Me!

A small, mildly infuriating bowling game. Get three strikes. Strikes summon a dancing mariachi cat and an original synthesized mariachi-style fanfare. Every nonstrike triggers a nonsense captcha with arbitrary acceptance. Get through it and you keep your strikes; abandon it and the run resets.

## Play

Requires Python 3 and, for the convenience commands/tests, Node.js.

```sh
cd "/Users/aimeeredmond/Documents/code/Vibe Coding/FactoryDroid/MariachiBowling"
npm start
```

Open http://localhost:5174. No install or build step needed.

- Aim with the slider or click/tap the lane.
- Click **Let it roll** (or press **Space**) to charge, then again to release.
- Check the lane oil readout: each arrow is about 10% of hook. Aim the opposite way to compensate.
- Your aim wobbles while charging. Release when the dotted line and the power marker are both where you want them.
- Each strike in a row shrinks the green zone, speeds up the meter, and increases the wobble. Occasionally a hidden nudge ruins everything.
- Misses trigger one of six captchas: image grid, a slider whose target runs away, a checkbox that unticks itself, a word you must retype in increasingly silly ways, a tiny (much easier) bowling lane where you keep rolling until you get a strike, or whack-a-mole (don't whack the cat). Solve it, or keep verifying: acceptance is random after the first attempt and guaranteed by the seventh. Abandoning starts a fresh run.
- Sound can be muted. Best streak saves locally when browser storage is available.
- Supports touch, keyboard controls, and reduced-motion preferences.

## Test

```sh
npm test
```

The game has no runtime dependencies or backend. Google Fonts is optional; system fallback fonts work offline. All game files are isolated in this folder.
