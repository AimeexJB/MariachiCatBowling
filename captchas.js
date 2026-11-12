const pick = items => items[Math.floor(Math.random() * items.length)];
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const shuffle = items => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

const gridPrompts = [
  'Select all images that feel like a Tuesday.',
  'Select every object that owes you an apology.',
  'Which squares are thinking about buying a boat?',
  'Select all images containing the concept of “almost.”',
  'Identify the traffic lights. They are on annual leave.',
  'Select the objects most likely to reply “per my last email.”',
  'Which of these images is your biological accountant?',
  'Select every square that would survive a medieval winter.',
  'Click all images that have never been to Ohio.',
  'Select the items you would trust with your bowling shoes.',
  'Which of these squares would win in a fight against a Monday?',
  'Select every image that is secretly a mariachi.',
  'Click the squares that remind you of your second-favourite cousin.',
  'Select all images that are pretending to be busy.'
];
const tiles = [['🪑','chair'],['🍋','lemon'],['🦆','duck'],['🧦','sock'],['🪴','plant'],['🧀','cheese'],['🛸','UFO'],['🗿','statue'],['🥐','croissant'],['🐟','fish'],['🧻','toilet paper'],['🦷','tooth'],['🎺','trumpet'],['🌵','cactus'],['🥁','drum'],['🪕','banjo'],['🐌','snail'],['🧲','magnet'],['🥒','cucumber'],['🪣','bucket'],['🎳','bowling pins'],['🦩','flamingo'],['🧽','sponge'],['🌮','taco'],['🪤','mousetrap'],['🦔','hedgehog']];

function grid() {
  let stage, ui;
  function build() {
    ui.setPrompt(pick(gridPrompts));
    const size = pick([3, 3, 4]), pool = shuffle(tiles);
    const board = el('div', { className: 'captcha-grid' });
    board.style.gridTemplateColumns = `repeat(${size},1fr)`;
    if (size === 4) board.classList.add('small-tiles');
    for (let i = 0; i < size * size; i++) {
      const [emoji, name] = Math.random() < 0.7 ? pool[i % pool.length] : pick(tiles);
      const button = el('button', { type: 'button', textContent: emoji });
      button.setAttribute('aria-label', `Tile ${i + 1}: ${name}`);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => button.setAttribute('aria-pressed', String(button.classList.toggle('selected'))));
      board.append(button);
    }
    stage.replaceChildren(board);
  }
  return {
    title: pick(['Prove you’re… something.', 'Pick the right squares.', 'A very normal image test.']),
    mount(target, api) { stage = target; ui = api; build(); },
    verify() { build(); return { pass: false }; }
  };
}

const sliderFlavours = [
  { title: 'Calibrate your humanity.', ask: n => `Drag the slider to exactly ${n}% human.`, unit: '%', left: 'TOASTER', right: 'POET', label: 'Humanity percentage', off: g => `You are ${g}% away from being a person.` },
  { title: 'Confidence check.', ask: n => `Set your confidence to exactly ${n}%. Not a smidge more.`, unit: '%', left: 'NOPE', right: 'UNBEARABLE', label: 'Confidence percentage', off: g => `Your confidence is off by ${g}. We can tell.` },
  { title: 'Adjust your vibe.', ask: n => `Set your vibe to precisely ${n}.`, unit: '', left: 'SOGGY', right: 'IMMACULATE', label: 'Vibe level', off: g => `That vibe is ${g} units of wrong.` },
  { title: 'Regret measurement.', ask: n => `Slide to exactly ${n} grams of regret about that last roll.`, unit: 'g', left: 'NONE', right: 'ALL OF IT', label: 'Grams of regret', off: g => `You are ${g} grams of regret short. Or over. Who can say.` },
  { title: 'Lane temperature.', ask: n => `Set the lane temperature to ${n}°. The pins are very particular.`, unit: '°', left: 'TEPID', right: 'SPICY', label: 'Lane temperature', off: g => `The pins say it is ${g}° off. They are shivering.` },
  { title: 'Cat approval.', ask: n => `Set Señor Whiskers’ approval of you to exactly ${n}%.`, unit: '%', left: 'HISSING', right: 'PURRING', label: 'Cat approval percentage', off: g => `Señor Whiskers is ${g}% unimpressed.` }
];

function slider() {
  const flavour = pick(sliderFlavours), tolerance = pick([2, 2, 3]), jumpiness = 0.5 + Math.random() * 0.3;
  const start = pick([0, 50, 100]);
  let target, range, readout, ui;
  do target = randomInt(5, 95); while (Math.abs(target - start) <= 15);
  const ask = () => ui.setPrompt(`${flavour.ask(target)} Within ${tolerance} is fine. We are not monsters.`);
  return {
    title: flavour.title,
    mount(stage, api) {
      ui = api; ask();
      readout = el('output', { className: 'slider-readout', textContent: `${start}${flavour.unit}` });
      range = el('input', { type: 'range', min: 0, max: 100, value: start });
      range.setAttribute('aria-label', flavour.label);
      range.addEventListener('input', () => {
        const value = Number(range.value);
        readout.textContent = `${value}${flavour.unit}`;
        if (Math.abs(value - target) <= tolerance && Math.random() < jumpiness) {
          do target = randomInt(5, 95); while (Math.abs(target - value) < 20);
          ask();
          ui.say(pick(['Too eager. The target has relocated.', 'The target saw you coming and left.', 'You got close, which made it nervous.', 'The number has gone on a little walk.', 'We moved it. For your growth.']));
        }
      });
      stage.replaceChildren(el('div', { className: 'slider-captcha' }, readout, range, el('div', { className: 'range-labels' }, el('span', { textContent: flavour.left }), el('span', { textContent: flavour.right }))));
    },
    verify() {
      const gap = Math.abs(Number(range.value) - target);
      return gap <= tolerance ? { pass: true } : { pass: false, message: flavour.off(gap) };
    }
  };
}

const checkboxLabels = ['I am not a robot', 'I am a human with feelings', 'I am not three raccoons in a coat', 'I have never been a toaster', 'I am not a cat (no offence)'];
const untickExcuses = ['We unticked it. You seemed unsure.', 'The box got shy.', 'Our intern unticked it by accident. Again.', 'A gust of wind. Indoors. Weird.', 'Señor Whiskers batted it off the table.', 'That tick looked forged.', 'The box needs a moment.'];

function checkbox() {
  const needed = randomInt(2, 4), delay = randomInt(450, 1100), excuses = shuffle(untickExcuses);
  const text = pick(checkboxLabels);
  let box, label, timer, unchecks = 0, ui;
  return {
    title: pick(['Just tick the box.', 'One tiny checkbox.', 'Basic box verification.']),
    mount(stage, api) {
      ui = api;
      ui.setPrompt(pick(['One click. That’s all. We promise.', 'Tick the box. It is extremely easy and will remain easy.', 'Simply confirm the statement below. No tricks.']));
      box = el('input', { type: 'checkbox', id: 'robot-box' });
      label = el('label', { htmlFor: 'robot-box', textContent: text });
      box.addEventListener('change', () => {
        clearTimeout(timer);
        if (box.checked && unchecks < needed) timer = setTimeout(() => {
          box.checked = false; unchecks++;
          ui.say(excuses[unchecks - 1]);
          if (unchecks === needed) label.textContent = `${text} (for real this time)`;
        }, delay);
      });
      stage.replaceChildren(el('div', { className: 'robot-box' }, box, label, el('span', { className: 'robot-logo', textContent: pick(['♻︎ reCATcha', '🐾 hCATcha', '🎳 PINcha']) })));
    },
    verify() {
      if (!box.checked) return { pass: false, message: pick(['The box is unticked. We noticed.', 'An empty box. Bold choice.', 'Nothing ticked. Nothing gained.']) };
      if (unchecks < needed) return { pass: false, message: 'Too fast. Robots are fast.' };
      return { pass: true };
    },
    destroy() { clearTimeout(timer); }
  };
}

const typingWords = ['meow', 'gutter', 'sombrero', 'strike', 'whiskers', 'spare', 'tuna', 'mariachi', 'pinsetter', 'bumper', 'taco', 'guitar', 'trumpet', 'kitten', 'lane', 'split', 'turkey', 'hairball', 'maracas', 'noodle', 'pickle', 'biscuit', 'nacho', 'fiesta', 'purr'];
const reverse = w => [...w].reverse().join('');
const twists = [
  { ask: 'Now type it backwards.', make: reverse },
  { ask: 'Now in ALL CAPS.', make: w => w.toUpperCase(), exact: true },
  { ask: 'Now with a space between every letter.', make: w => [...w].join(' ') },
  { ask: 'Now without any vowels.', make: w => w.replace(/[aeiou]/g, '') },
  { ask: 'Now type every letter twice.', make: w => [...w].map(c => c + c).join('') },
  { ask: 'Now move the first letter to the end.', make: w => w.slice(1) + w[0] },
  { ask: 'Now with only the vowels in CAPITALS.', make: w => w.replace(/[aeiou]/g, c => c.toUpperCase()), exact: true },
  { ask: 'Now backwards, in ALL CAPS.', make: w => reverse(w).toUpperCase(), exact: true },
  { ask: 'Now with “meow” on both ends.', make: w => `meow${w}meow` },
  { ask: 'Now just the last three letters.', make: w => w.slice(-3) },
  { ask: 'Now shout it. All caps, three exclamation marks.', make: w => `${w.toUpperCase()}!!!`, exact: true }
];
const praise = ['Correct. Unfortunately, that was the warm-up.', 'Lovely. Again, but different.', 'Nailed it. The department remains unconvinced.', 'Yes! Now for no reason at all:', 'Perfect. Suspiciously perfect.'];
const fonts = ['Georgia, serif', '"Courier New", monospace', '"Trebuchet MS", sans-serif', '"Times New Roman", serif', 'Impact, sans-serif'];
const normalise = v => v.trim().replace(/\s+/g, ' ');

function typing() {
  const word = pick(typingWords);
  const steps = [
    { ask: pick(['Type the characters you see.', 'Type the word in the box.', 'Please transcribe this perfectly legible word.']), answer: word },
    ...shuffle(twists).slice(0, randomInt(1, 3)).map(t => ({ ask: t.ask, answer: t.make(word), exact: !!t.exact }))
  ];
  let step = 0, input, ui;
  const matches = (value, s) => (s.exact ? normalise(value) === s.answer : normalise(value).toLowerCase() === s.answer.toLowerCase());
  return {
    title: pick(['Type what you see.', 'Read the squiggles.', 'A simple typing test.']),
    steps,
    mount(stage, api) {
      ui = api; ui.setPrompt(steps[0].ask);
      const art = el('div', { className: 'distorted', ariaHidden: 'true' });
      art.style.fontFamily = pick(fonts);
      art.style.background = `repeating-linear-gradient(${randomInt(-60, 60)}deg,#ece2ce 0 ${randomInt(6, 11)}px,#e3d4b9 0 ${randomInt(12, 18)}px)`;
      for (const char of word) {
        const span = el('span', { textContent: char });
        span.style.transform = `rotate(${randomInt(-30, 30)}deg) translateY(${randomInt(-8, 8)}px) scale(${(0.75 + Math.random() * 0.55).toFixed(2)})`;
        span.style.color = pick(['#4b3a33', '#8f3221', '#3f6146', '#5b4a7a']);
        art.append(span);
      }
      input = el('input', { className: 'text-entry', type: 'text', autocomplete: 'off', spellcheck: false, placeholder: 'Type here…' });
      input.setAttribute('aria-label', `Type the word ${word}, following the latest instruction`);
      stage.replaceChildren(art, input);
    },
    verify() {
      if (!matches(input.value, steps[step])) return { pass: false, message: pick(['That is not what you see. We checked.', 'Close, but in a different direction.', 'Our records show a different answer. Our records are a cat.']) };
      step++;
      if (step === steps.length) return { pass: true };
      ui.setPrompt(steps[step].ask); input.value = ''; input.focus();
      return { pass: false, message: pick(praise) };
    }
  };
}

const pinLayout = [4, 3, 2, 1].flatMap((count, row) =>
  Array.from({ length: count }, (_, col) => ({ x: 50 + (col - (count - 1) / 2) * 8, y: 8 + row * 9 })));

// Deliberately far easier than the real lane: no power, no curve, a wide strike window.
function miniBowling() {
  const strikeWidth = randomInt(12, 17), period = randomInt(380, 520);
  let ui, ball, pins, rollButton, frame, timer, pos = 50, start = 0, busy = false, done = false, rolls = 0;
  const sweep = now => {
    pos = 50 + 42 * Math.sin((now - start) / period);
    ball.style.left = `${pos}%`;
    frame = requestAnimationFrame(sweep);
  };
  function knock(count) {
    const order = pins.map((pin, i) => ({ pin, d: Math.abs(pinLayout[i].x - pos) })).sort((a, b) => a.d - b.d);
    order.forEach(({ pin }, i) => pin.classList.toggle('down', i < count));
  }
  function roll() {
    if (busy || done) return;
    busy = true; rolls++; cancelAnimationFrame(frame);
    rollButton.disabled = true;
    const offset = Math.abs(pos - 50);
    const count = offset <= strikeWidth ? 10 : offset > 38 ? 0 : Math.min(9, Math.max(1, Math.round(10 - (offset - strikeWidth) / 3)));
    ball.classList.add('rolling');
    timer = setTimeout(() => {
      knock(count);
      if (count === 10) {
        done = true;
        ui.say(pick(['STRIKE! Humanity confirmed. Mostly.', 'STRIKE! The department is grudgingly impressed.', 'STRIKE! Was that so hard? (Yes.)']));
        timer = setTimeout(() => ui.pass(), 900);
        return;
      }
      ui.say(count === 0 ? pick(['Gutter. In the captcha. Impressive, honestly.', 'The ball has left the captcha.']) : pick([`${count} pins. The rest are unionised.`, `${count} pins. Close enough is not a strike.`, `${count}. The pins are laughing quietly.`, `${count} pins. Roll ${rolls} of as many as it takes.`]));
      timer = setTimeout(() => {
        pins.forEach(pin => pin.classList.remove('down'));
        ball.classList.remove('rolling');
        busy = false; rollButton.disabled = false; rollButton.focus();
        start = performance.now() - Math.asin(Math.max(-1, Math.min(1, (pos - 50) / 42))) * period;
        frame = requestAnimationFrame(sweep);
      }, 1100);
    }, 550);
  }
  return {
    title: pick(['Bowl a tiny strike.', 'A small, easy bowling test.', 'Prove you can bowl. Again.']),
    mount(stage, api) {
      ui = api;
      ui.setPrompt(pick(['Robots cannot bowl. Roll a strike on this tiny lane to continue.', 'Knock down all 10 tiny pins. Keep rolling until you do.', 'Strike to proceed. This lane is much friendlier. Allegedly.']));
      const lane = el('div', { className: 'mini-lane' });
      pins = pinLayout.map(({ x, y }) => {
        const pin = el('span', { className: 'mini-pin' });
        pin.style.left = `${x}%`; pin.style.top = `${y}%`;
        lane.append(pin);
        return pin;
      });
      ball = el('span', { className: 'mini-ball' });
      lane.append(ball);
      lane.setAttribute('aria-hidden', 'true');
      rollButton = el('button', { type: 'button', className: 'mini-roll', textContent: 'ROLL THE TINY BALL' });
      rollButton.addEventListener('click', roll);
      lane.addEventListener('click', roll);
      stage.replaceChildren(lane, rollButton);
      start = performance.now();
      frame = requestAnimationFrame(sweep);
    },
    verify() {
      return { pass: done, message: done ? '' : 'The pins are still standing. We checked. They are smug.' };
    },
    destroy() { cancelAnimationFrame(frame); clearTimeout(timer); }
  };
}

function whackAMole() {
  const needed = randomInt(5, 8);
  let ui, holes, counter, timer, current = -1, whacked = 0, done = false;
  const render = () => { counter.textContent = `Whacked: ${whacked} / ${needed}`; };
  function hide() {
    if (current >= 0) {
      const hole = holes[current];
      hole.textContent = ''; hole.className = 'mole-hole';
      hole.setAttribute('aria-label', `Hole ${current + 1}: empty`);
    }
    current = -1;
  }
  function popUp() {
    if (done) return;
    hide();
    let next;
    do next = randomInt(0, 8); while (next === current);
    current = next;
    const decoy = Math.random() < 0.2, hole = holes[next];
    hole.textContent = decoy ? '😼' : '🐹';
    hole.className = `mole-hole up${decoy ? ' decoy' : ''}`;
    hole.setAttribute('aria-label', `Hole ${next + 1}: ${decoy ? 'Señor Whiskers, do not whack' : 'mole, whack it'}`);
    timer = setTimeout(() => { hide(); timer = setTimeout(popUp, randomInt(200, 450)); }, randomInt(750, 1150));
  }
  function whack(index) {
    if (done) return;
    const hole = holes[index];
    if (index !== current) { ui.say(pick(['That hole was empty. It’s fine. Emotionally.', 'You whacked the air. The air is upset.', 'Nothing there. Bold strategy.'])); return; }
    clearTimeout(timer);
    if (hole.classList.contains('decoy')) {
      whacked = Math.max(0, whacked - 2);
      ui.say(pick(['That was Señor Whiskers. He’s fine. You lose 2.', 'You bonked the cat. Minus 2. He will remember this.', 'Not the cat! −2 and a strongly worded meow.']));
    } else {
      whacked++;
      ui.say(whacked >= needed ? 'Moles defeated. You are terrifying.' : pick(['Bonk.', 'Got one. It was probably innocent.', 'Whack! The mole files a complaint.', 'Nice. Keep going, menace.']));
    }
    render(); hide();
    if (whacked >= needed) { done = true; timer = setTimeout(() => ui.pass(), 900); return; }
    timer = setTimeout(popUp, randomInt(250, 450));
  }
  return {
    title: pick(['Whack the moles.', 'Pest control verification.', 'Mole-based identity check.']),
    mount(stage, api) {
      ui = api;
      ui.setPrompt(`Whack ${needed} moles to prove you are human. Do not whack the cat.`);
      counter = el('div', { className: 'mole-counter' });
      counter.setAttribute('aria-live', 'polite');
      const board = el('div', { className: 'mole-board' });
      holes = Array.from({ length: 9 }, (_, i) => {
        const hole = el('button', { type: 'button', className: 'mole-hole' });
        hole.setAttribute('aria-label', `Hole ${i + 1}: empty`);
        hole.addEventListener('click', () => whack(i));
        board.append(hole);
        return hole;
      });
      stage.replaceChildren(counter, board);
      render();
      timer = setTimeout(popUp, 600);
    },
    verify() {
      return { pass: done, message: done ? '' : `${needed - whacked} moles remain at large.` };
    },
    destroy() { clearTimeout(timer); }
  };
}

const types = { grid, slider, checkbox, typing, miniBowling, whackAMole };

export function createCaptcha(previousType) {
  const type = pick(Object.keys(types).filter(t => t !== previousType));
  return { type, destroy() {}, ...types[type]() };
}
