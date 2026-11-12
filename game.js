import { GOAL, scoreShot, nextStreak, captchaAccepts, powerAt, difficulty, rollConditions, describeOil, pathOffset, simulateRoll, aimWobble } from './logic.js';
import { createCaptcha } from './captchas.js';

const $ = id => document.getElementById(id);
const canvas = $('lane'), ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { phase: 'ready', aim: 0, power: 0, streak: 0, best: 0, rolls: 0, knocked: 0, ball: null, chargeStart: 0, wobble: 0, conditions: { curve: 0, chaos: 0 }, sound: true };
try { state.best = Math.min(3, Math.max(0, Number(localStorage.getItem('spare-me-best')) || 0)); } catch { /* Storage is optional. */ }
let audio, timers = [], activeNotes = [], captchaAttempts = 0, previousFocus, captcha, lastCaptchaType;

function later(callback, delay) { timers.push(setTimeout(callback, delay)); }
function shape(points, fill) {
  ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function ellipse(x,y,rx,ry,color) {
  ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
}
function line(x1,y1,x2,y2,color,width=1) {
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
}
function pin(x,y,scale,tilt=0) {
  ctx.save(); ctx.translate(x,y); ctx.rotate(tilt); ctx.scale(scale,scale);
  ellipse(0,2,12,4,'#26251d45');
  ctx.beginPath(); ctx.moveTo(-8,0); ctx.bezierCurveTo(-15,-13,-4,-25,-5,-32);
  ctx.bezierCurveTo(-14,-46,14,-46,5,-32); ctx.bezierCurveTo(4,-25,15,-13,8,0); ctx.closePath();
  const g=ctx.createLinearGradient(-12,0,12,0); g.addColorStop(0,'#d2cbb5'); g.addColorStop(.45,'#fffdf0'); g.addColorStop(1,'#e5ddc5');
  ctx.fillStyle=g; ctx.fill(); line(-5,-28,5,-28,'#b74e3e',3); line(-5,-24,5,-24,'#b74e3e',2); ctx.restore();
}
function drawBall(x,y,r) {
  ellipse(x+4,y+r*.65,r*1.15,r*.32,'#30292440');
  const g=ctx.createRadialGradient(x-r*.4,y-r*.5,0,x,y,r);
  g.addColorStop(0,'#d97457'); g.addColorStop(.5,'#ad4334'); g.addColorStop(1,'#6d302a');
  ellipse(x,y,r,r,g);
  ellipse(x-r*.24,y-r*.38,r*.1,r*.12,'#4c2825');
  ellipse(x+r*.05,y-r*.44,r*.1,r*.12,'#4c2825');
  ellipse(x-r*.04,y-r*.1,r*.12,r*.13,'#4c2825');
}
function draw() {
  ctx.clearRect(0,0,1000,660);
  const bg=ctx.createLinearGradient(0,0,0,660); bg.addColorStop(0,'#28302b'); bg.addColorStop(1,'#36382e');
  ctx.fillStyle=bg; ctx.fillRect(0,0,1000,660);
  shape([[0,180],[230,180],[0,660]],'#77705a');
  shape([[770,180],[1000,180],[1000,660]],'#77705a');
  shape([[0,190],[210,190],[0,610]],'#a99a72');
  shape([[790,190],[1000,190],[1000,610]],'#a99a72');
  for(let i=0;i<13;i++) {
    line(110+i*10,190,-340+i*35,660,'#857c6044');
    line(790+i*10,190,920+i*35,660,'#857c6044');
  }
  ctx.fillStyle='#252b26'; ctx.fillRect(0,0,1000,184);
  line(0,180,1000,180,'#807552',3);
  for(const x of [142,858]) {
    line(x,0,x,69,'#544e3c',2);
    shape([[x-28,88],[x-13,65],[x+13,65],[x+28,88]],'#b59e71');
    ellipse(x,88,27,4,'#efd49b');
    const glow=ctx.createRadialGradient(x,100,1,x,130,98);
    glow.addColorStop(0,'#edc57c18'); glow.addColorStop(1,'#edc57c00');
    ctx.fillStyle=glow; ctx.fillRect(x-100,90,200,100);
  }
  ctx.textAlign='center'; ctx.fillStyle='#d2bc8e'; ctx.font='600 36px Georgia'; ctx.fillText('EL GATO LANES',500,92);
  ctx.font='10px sans-serif'; ctx.fillStyle='#a99b7a'; ctx.fillText('B O W L  A  L I T T L E .  L O S E  A  L I T T L E .',500,115);
  shape([[337,192],[663,192],[945,660],[55,660]],'#161e1a');
  shape([[350,192],[650,192],[896,660],[104,660]],'#817550');
  const wood=ctx.createLinearGradient(0,192,0,660);
  wood.addColorStop(0,'#b49b6a'); wood.addColorStop(.55,'#d5b67e'); wood.addColorStop(1,'#e2c690');
  shape([[361,192],[639,192],[850,660],[150,660]],wood);
  for(let i=0;i<=20;i++) {
    const a=i/20;
    line(361+a*278,192,150+a*700,660,i%2?'#9a795532':'#f6dfaa28');
    for(let j=0;j<4;j++) {
      const y=250+j*105+(i%3)*22,t=(y-192)/468,left=361-211*t,width=278+422*t;
      line(left+a*width,y,left+(a+.05)*width,y,'#97754f22');
    }
  }
  for(let i=0;i<7;i++) {
    const x=500+(i-3)*44,y=434+Math.abs(i-3)*12;
    shape([[x,y-5],[x-4,y+4],[x+4,y+4]],'#7661409a');
    ellipse(500+(i-3)*47,554,2,2,'#78603f80');
  }
  line(183,586,817,586,'#735c463b',2);
  let index=0;
  for(let row=3;row>=0;row--) for(let col=0;col<=row;col++) {
    const x=500+(col-row/2)*27,y=262-row*15;
    // The head pin is drawn last (index 9), so front pins fall first.
    const fallen=state.phase==='result'&&index>=10-state.knocked;
    if(!fallen) pin(x,y,.79+(3-row)*.025);
    else pin(x+(index%2?18:-18),y+7,.8,index%2?1.35:-1.4);
    index++;
  }
  if(state.phase==='ready'||state.phase==='charging') {
    const aim=state.aim+(state.phase==='charging'?state.wobble:0),x=500+aim*2.7;
    ctx.setLineDash([6,9]); line(x,564,500+aim*1.5,278,'#fff5da6e',2); ctx.setLineDash([]);
    drawBall(x,575,30);
  } else if(state.ball) drawBall(state.ball.x,state.ball.y,state.ball.radius);
  const vignette=ctx.createRadialGradient(500,370,200,500,370,630);
  vignette.addColorStop(0,'#00000000'); vignette.addColorStop(1,'#111d1865');
  ctx.fillStyle=vignette; ctx.fillRect(0,0,1000,660);
}
function updateStats() {
  document.querySelectorAll('.streak-slots>div').forEach((slot,i)=>slot.classList.toggle('filled',i<state.streak));
  document.querySelector('.streak-slots').setAttribute('aria-label',`${state.streak} of 3 strikes`);
  $('best').textContent=`${state.best} / 3`;
  $('roll-count').textContent=`ROLL ${String(state.rolls+1).padStart(2,'0')}`;
  $('streak-note').innerHTML=[
    'Three in a row. No pressure.<br>Okay, a little pressure.',
    'One down. The cat is warming up.<br>Two more. Stay cool.',
    'Two strikes. One to glory.<br>Try not to think about it.',
    'Three strikes. Certified legend.<br>The cat salutes you.'
  ][state.streak];
}
function setPower(power) {
  state.power=power;
  $('power-fill').style.width=`${power*100}%`; $('power-marker').style.left=`${power*100}%`;
  $('power-value').textContent=`${Math.round(power*100)}%`;
  document.querySelector('.power-track').setAttribute('aria-valuenow',Math.round(power*100));
}
function setAim(value) {
  state.aim=Math.max(-100,Math.min(100,value)); $('aim').value=state.aim;
  $('aim-value').textContent=Math.abs(state.aim)<6?'DEAD CENTER':`${Math.abs(Math.round(state.aim))}% ${state.aim<0?'LEFT':'RIGHT'}`;
  draw();
}
function initAudio() {
  if(!state.sound) return;
  try {
    audio??=new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended') audio.resume().catch(()=>{});
  } catch { /* Audio is optional. */ }
}
function note(hz,time,duration,type='triangle',volume=.07) {
  if(!audio||!state.sound) return;
  const osc=audio.createOscillator(),gain=audio.createGain();
  osc.type=type; osc.frequency.value=hz;
  gain.gain.setValueAtTime(0,time); gain.gain.linearRampToValueAtTime(volume,time+.018);
  gain.gain.exponentialRampToValueAtTime(.001,time+duration);
  osc.connect(gain); gain.connect(audio.destination); osc.start(time); osc.stop(time+duration+.03);
  activeNotes.push(osc);
  osc.onended=()=>{ activeNotes=activeNotes.filter(n=>n!==osc); osc.disconnect(); gain.disconnect(); };
}
function stopMusic() { for(const osc of activeNotes) { try { osc.stop(); } catch { /* Already ended. */ } } activeNotes=[]; }
function fanfare() {
  if(!audio||!state.sound) return;
  const start=audio.currentTime+.02,beat=.19;
  // Original 6/8 trumpet-style melody with plucked tonic/dominant chords.
  [76,76,76,79,76,72,74,74,74,77,74,71,72,76,79,84,79,76].forEach((m,i)=>{
    const hz=440*2**((m-69)/12);
    note(hz,start+i*beat,beat*.85,'sawtooth',.028);
    note(hz*1.004,start+i*beat,beat*.8,'triangle',.04);
  });
  for(let i=0;i<18;i++) {
    const chord=i>=6&&i<12?[43,59,62,65]:[48,60,64,67];
    (i%3===0?[chord[0]]:chord.slice(1)).forEach((m,j)=>note(440*2**((m-69)/12),start+i*beat+j*.012,.16,'triangle',.075));
  }
}
function showDialog(id) {
  previousFocus=document.activeElement; $(id).showModal();
}
function closeDialog(id) {
  $(id).close();
  if(previousFocus&&!previousFocus.disabled) previousFocus.focus();
}
function ready() {
  state.phase='ready'; state.knocked=0; state.ball=null; state.wobble=0;
  state.conditions=rollConditions();
  $('lane-oil').textContent=describeOil(state.conditions.curve);
  const [low,high]=difficulty(state.streak).zone;
  Object.assign(document.querySelector('.sweet-spot').style,{left:`${low*100}%`,width:`${(high-low)*100}%`});
  setPower(0); $('aim').disabled=false; $('bowl').disabled=false;
  $('bowl').innerHTML='LET IT ROLL <span>↗</span>';
  $('lane-message').textContent=state.streak===2?'One more. Do not perceive the pressure.':'Your moment of glory. Probably.';
  updateStats(); draw();
}
function reset() {
  timers.forEach(clearTimeout); timers=[]; stopMusic(); captcha?.destroy(); captcha=null;
  for(const id of ['captcha','win','rules']) if($(id).open) $(id).close();
  $('celebration').hidden=true;
  state.streak=0; state.rolls=0; setAim(0); ready();
}
function roll() {
  if(state.phase!=='ready'&&state.phase!=='charging') return;
  if(document.querySelector('dialog[open]')) return;
  initAudio();
  if(state.phase==='ready') {
    state.phase='charging'; state.chargeStart=performance.now();
    $('bowl').innerHTML='RELEASE! <span>↗</span>';
    $('lane-message').textContent='A little confidence. A little green zone.';
    requestAnimationFrame(charge); return;
  }
  // Measure at release, not at the previous animation frame.
  const elapsed=performance.now()-state.chargeStart,level=difficulty(state.streak);
  setPower(powerAt(elapsed,level.period));
  const aim=state.aim+aimWobble(elapsed,level.wobble),{curve,chaos}=state.conditions;
  const sim=simulateRoll(aim,curve,chaos);
  const pins=sim.gutterAt===null?scoreShot(sim.impact,state.power,level.zone):0;
  state.phase='rolling'; state.rolls++; $('aim').disabled=true; $('bowl').disabled=true;
  $('bowl').innerHTML='ROLLING… <span>↗</span>'; $('lane-message').textContent='Your fate is in the hands of a cat.';
  const start=performance.now(),duration=reducedMotion?200:1250;
  function animate(now) {
    if(state.phase!=='rolling') return;
    const t=Math.min(1,(now-start)/duration),e=1-(1-t)**1.5;
    const offset=sim.gutterAt!==null&&e>=sim.gutterAt?Math.sign(sim.impact)*108:pathOffset(aim,curve,chaos,e);
    state.ball={x:500+offset*(2.7-1.2*e),y:575-322*e,radius:30-18*e};
    draw();
    if(t<1) requestAnimationFrame(animate); else result(pins,sim.gutterAt!==null,chaos);
  }
  requestAnimationFrame(animate);
}
function charge(now) {
  if(state.phase!=='charging') return;
  const elapsed=now-state.chargeStart,level=difficulty(state.streak);
  setPower(powerAt(elapsed,level.period)); state.wobble=aimWobble(elapsed,level.wobble);
  draw(); requestAnimationFrame(charge);
}
function result(pins,gutter,chaos) {
  state.phase='result'; state.ball=null; state.knocked=pins;
  state.streak=nextStreak(state.streak,pins);
  state.best=Math.max(state.best,state.streak);
  try { localStorage.setItem('spare-me-best',state.best); } catch { /* Storage is optional. */ }
  updateStats(); draw();
  if(pins===10) {
    $('lane-message').textContent=''; $('celebration').hidden=false; fanfare();
    later(()=>{
      $('celebration').hidden=true;
      if(state.streak===GOAL) { state.phase='won'; showDialog('win'); }
      else ready();
    },3700);
  } else {
    const excuse=chaos?`${randomItem(['Señor Whiskers sneezed mid-roll.','A draft from the snack bar nudged it.','The lane remembered something sad.'])} `:'';
    $('lane-message').textContent=excuse+(gutter||pins===0?'Gutter. The captcha department has been notified.':`${pins} of 10. So close. So administratively inconvenient.`);
    later(openCaptcha,950);
  }
}
function randomItem(items) { return items[Math.floor(Math.random()*items.length)]; }
function say(message) { $('captcha-feedback').textContent=message; }
function closeCaptcha() { captcha?.destroy(); captcha=null; closeDialog('captcha'); }
function acceptCaptcha(solved) {
  closeCaptcha(); ready(); $('bowl').focus();
  $('lane-message').textContent=solved?'Verified. We are as surprised as you are.':'Human enough. Your case has been quietly dismissed.';
}
function openCaptcha() {
  state.phase='captcha'; captchaAttempts=0;
  const current=captcha=createCaptcha(lastCaptchaType); lastCaptchaType=captcha.type;
  $('captcha-title').textContent=captcha.title;
  // Mini-games finish on their own; ignore a late pass from a captcha that was already closed.
  captcha.mount($('captcha-stage'),{say,setPrompt:text=>{$('captcha-prompt').textContent=text;},pass:()=>{ if(captcha===current) acceptCaptcha(true); }});
  say('There are no wrong answers. Except yours, probably.');
  $('verify').innerHTML='VERIFY MY EXISTENCE <span>→</span>';
  showDialog('captcha');
}
$('verify').addEventListener('click',()=>{
  if(!captcha) return;
  captchaAttempts++;
  const outcome=captcha.verify();
  if(outcome.pass||captchaAccepts(captchaAttempts)) {
    acceptCaptcha(outcome.pass);
  } else {
    say(outcome.message||randomItem([
      'Correct, but not emotionally correct. Try again.',
      'Your answer was right before you clicked it. Not anymore.',
      'Please select the same answer, but with more conviction.',
      'Our system detected a suspicious amount of free will.',
      'Almost! Unfortunately, “almost” has been discontinued.',
      'The duck disagrees. We are legally required to side with the duck.'
    ]));
    $('verify').innerHTML=['VERIFY HARDER','ASK THE DUCK AGAIN','APPEAL TO ABSOLUTELY NO ONE'][captchaAttempts%3]+' <span>→</span>';
  }
});
$('captcha-stage').addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target.matches('input[type=text]')) { e.preventDefault(); $('verify').click(); }
});
$('bowl').addEventListener('click',roll);
$('aim').addEventListener('input',e=>setAim(Number(e.target.value)));
canvas.addEventListener('pointerdown',e=>{
  if(state.phase!=='ready'&&state.phase!=='charging') return;
  const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*1000;
  setAim(Math.round((x-500)/2.7));
});
document.addEventListener('keydown',e=>{
  if(e.code!=='Space'||e.repeat||document.querySelector('dialog[open]')) return;
  if(['INPUT','BUTTON','A'].includes(document.activeElement.tagName)) return;
  e.preventDefault(); roll();
});
$('sound').addEventListener('click',()=>{
  state.sound=!state.sound; $('sound').setAttribute('aria-pressed',state.sound);
  $('sound').textContent=state.sound?'♫ Sound on':'♫ Sound off';
  if(!state.sound) stopMusic(); else initAudio();
});
$('reset').addEventListener('click',reset);
$('abandon').addEventListener('click',()=>{ reset(); $('bowl').focus(); });
$('play-again').addEventListener('click',()=>{ reset(); $('bowl').focus(); });
$('how-to').addEventListener('click',()=>{
  // Rules cannot interrupt a shot or accidentally leave charging running.
  if(state.phase==='charging') ready();
  if(state.phase==='ready') showDialog('rules');
});
$('close-rules').addEventListener('click',()=>closeDialog('rules'));
$('captcha').addEventListener('cancel',e=>{ e.preventDefault(); $('captcha-feedback').textContent='Escape? Bold. The department recommends more clicking.'; });
$('win').addEventListener('cancel',e=>{ e.preventDefault(); reset(); });
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&state.phase==='charging') ready();
});
ready();
