import { KEYS, LEVELS, RULES, WEAPONS } from './config.js';
import { advanceBattle, availability, createBattle, useWeapon } from './combat.js';
import { enemyTurn } from './ai.js';
import { drawCastle, drawLandscape } from './art.js';
import { createEffects } from './effects.js';
import { createSound } from './sound.js';

const $ = id => document.getElementById(id);
const game = document.querySelector('.game');
const castles = [$('castle0'),$('castle1')];
const overlay = $('overlay');
const content = $('panel-content');
const hint = $('hint');
const storageKey = 'moving-castle-battle-v1';
const progress = { unlocked:0, sound:false };
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (Number.isInteger(saved?.unlocked)) progress.unlocked = Math.max(0,Math.min(LEVELS.length-1,saved.unlocked));
  progress.sound = saved?.sound === true;
} catch {}
function save() {
  try { localStorage.setItem(storageKey,JSON.stringify(progress)); } catch {}
}

let level = progress.unlocked;
let battle = createBattle();
let state = '';
let nextEnemy = 0;
let resultDelay = 0;
let hintUntil = 0;
let installPrompt;
let previousFrame;

document.querySelector('.scenery').innerHTML = drawLandscape();
castles.forEach((element, side) => { element.innerHTML = drawCastle(side); });
$('weapons').innerHTML = KEYS.map((key,i) => {
  const weapon = WEAPONS[key];
  const color = ['#f6c667','#ff9264','#f5908b','#ffe690','#bc9fff','#69d9ff','#92e7aa'][i];
  return `<button class="weapon" data-weapon="${key}" style="--accent:${color}" aria-label="${weapon.name}，消耗 ${weapon.cost} 能量"><kbd>${i+1}</kbd><span aria-hidden="true" class="icon">${weapon.icon}</span><b>${weapon.name}</b><small></small><i aria-hidden="true"></i></button>`;
}).join('');
const controls = KEYS.map(key => ({
  key,
  button:document.querySelector(`[data-weapon="${key}"]`),
  crew:document.querySelector(`[data-crew="${key}"]`)
}));
const stats = battle.castles.map((_,i) => ({
  hp:$('hp'+i), bar:$('bar'+i), energy:$('energy'+i), charge:$('charge'+i)
}));
const effects = createEffects($('effects'),castles);
const playSound = createSound();

function emit(event) {
  effects.add(event);
  if (progress.sound) playSound(event);
}
function syncSound() {
  $('sound').textContent = progress.sound ? '🔊' : '🔇';
  $('sound').setAttribute('aria-pressed',String(progress.sound));
}
function syncLevel() {
  $('stage').textContent = `第 ${level+1} 關`;
  $('area').textContent = LEVELS[level][0];
  $('arena').style.setProperty('--hue',`${[0,9,-20,45,-35,80,110,-55,140,165][level]}deg`);
}
function update() {
  battle.castles.forEach((actor,i) => {
    const view = stats[i];
    view.hp.textContent = `${actor.hp} HP`;
    view.bar.style.width = `${100*actor.hp/RULES.hp}%`;
    view.energy.textContent = `⚡ ${Math.floor(actor.energy)}`;
    view.charge.style.width = `${100*actor.energy/RULES.energy}%`;
  });
  controls.forEach(({key,button,crew}) => {
    const weapon = WEAPONS[key];
    const remaining = Math.max(0,(battle.castles[0].ready[key] ?? 0)-battle.time);
    const reason = availability(battle,0,key);
    const disabled = state !== 'battle' || Boolean(reason);
    for (const control of [button,crew]) {
      control.setAttribute('aria-disabled',String(disabled));
      control.tabIndex = state === 'battle' ? 0 : -1;
    }
    button.querySelector('small').textContent = `⚡${weapon.cost}${remaining > 0 ? ' · '+Math.ceil(remaining)+'秒' : state === 'battle' && reason ? ' · '+reason : ''}`;
    button.querySelector('i').style.width = `${100*(1-remaining/weapon.cooldown)}%`;
  });
  if (hintUntil && battle.time >= hintUntil) {
    hint.textContent = '點武器或城堡隊員出招';
    hintUntil = 0;
  }
}
function setState(mode) {
  state = mode;
  game.classList.toggle('playing',mode === 'battle' || mode === 'ending');
  overlay.hidden = mode === 'battle' || mode === 'ending';
  $('pause').disabled = mode !== 'battle' && mode !== 'pause';
  $('pause').textContent = mode === 'pause' ? '▶' : 'Ⅱ';
  $('pause').setAttribute('aria-label',mode === 'pause' ? '繼續' : '暫停');
  update();
}
function showPanel(html, focus = true) {
  content.innerHTML = html;
  if (focus) content.querySelector('.primary')?.focus({preventScroll:true});
}
function showHome(focus = true) {
  battle = createBattle();
  effects.clear();
  hintUntil = 0;
  hint.textContent = '點武器或城堡隊員出招';
  syncLevel();
  setState('home');
  const stages = LEVELS.map(([name,difficulty],i) => `<button class="level" data-level="${i}" aria-label="第 ${i+1} 關，${name}，${difficulty}" aria-pressed="${i===level}" ${i>progress.unlocked?'disabled':''}>${i+1}</button>`).join('');
  showPanel(`<h1 id="panel-title">移動城堡大戰</h1>
    <p>${LEVELS[level][0]} · ${LEVELS[level][1]}</p>
    <div class="levels" aria-label="選擇關卡">${stages}</div>
    <div class="actions"><button class="primary" data-action="start">▶ 開始戰鬥</button>
    ${installPrompt ? '<button class="secondary" data-action="install">安裝遊戲</button>' : ''}</div>`,focus);
}
function start() {
  battle = createBattle();
  nextEnemy = LEVELS[level][2];
  previousFrame = undefined;
  effects.clear();
  hintUntil = 0;
  hint.textContent = '點武器或城堡隊員出招';
  if (progress.sound) playSound();
  syncLevel();
  setState('battle');
  if (!matchMedia('(pointer: coarse)').matches) controls[0].button.focus({preventScroll:true});
}
function tryWeapon(key) {
  if (state !== 'battle') return;
  const reason = availability(battle,0,key);
  if (reason) {
    hint.textContent = `${WEAPONS[key].name} · ${reason}`;
    hintUntil = battle.time + 1.2;
    return;
  }
  useWeapon(battle,0,key,emit);
  update();
}
function togglePause() {
  if (state === 'pause') {
    previousFrame = undefined;
    setState('battle');
    controls[0].button.focus({preventScroll:true});
  } else if (state === 'battle') {
    setState('pause');
    showPanel('<h2 id="panel-title">暫停</h2><div class="actions"><button class="primary" data-action="resume">繼續戰鬥</button><button class="secondary" data-action="home">返回首頁</button></div>');
  }
}
function finish() {
  const won = battle.winner === 0;
  const final = level === LEVELS.length - 1;
  setState('result');
  showPanel(`<h2 id="panel-title">${won ? (final?'🏆 全關通過！':'🏆 勝利！') : '💪 再試一次！'}</h2>
    <p>${won ? '藍色城堡獲勝' : '戰敗 · 紅色城堡獲勝'}</p>
    <div class="stats"><div><strong>${battle.time.toFixed(1)} 秒</strong>戰鬥時間</div>
    <div><strong>${battle.attacks}</strong>攻擊次數</div><div><strong>${battle.damage}</strong>總傷害</div>
    <div><strong>${battle.castles[0].hp}</strong>剩餘生命</div></div>
    <div class="actions">${won && !final ? '<button class="primary" data-action="next">下一關</button>' : ''}
    <button class="${won&&!final?'secondary':'primary'}" data-action="start">${won?'再玩一次':'重新挑戰'}</button>
    <button class="secondary" data-action="home">返回首頁</button></div>`);
}
function frame(now) {
  const dt = previousFrame === undefined ? 0 : Math.min(.1,(now-previousFrame)/1000);
  previousFrame = now;
  if (state === 'battle') {
    advanceBattle(battle,dt,emit);
    if (battle.winner !== null) {
      if (battle.winner === 0 && level >= progress.unlocked) {
        progress.unlocked = Math.min(level+1,LEVELS.length-1);
        save();
      }
      resultDelay = 0;
      setState('ending');
    } else if (battle.time >= nextEnemy) {
      enemyTurn(battle,level,emit);
      nextEnemy = battle.time + LEVELS[level][2];
    }
    effects.render(battle);
    update();
  } else if (state === 'ending') {
    resultDelay += dt;
    effects.render(battle,battle.time + resultDelay);
    if (resultDelay >= .89) finish();
  }
  requestAnimationFrame(frame);
}

game.addEventListener('click',async event => {
  const button = event.target.closest('button');
  if (!button) return;
  const {weapon,crew,action,level:selection} = button.dataset;
  if (weapon || crew) tryWeapon(weapon || crew);
  if (selection !== undefined) {
    level = Number(selection);
    showHome(false);
    content.querySelector(`[data-level="${level}"]`).focus({preventScroll:true});
  }
  if (action === 'start') start();
  if (action === 'next') { level++; start(); }
  if (action === 'home') showHome();
  if (action === 'resume') togglePause();
  if (action === 'install' && installPrompt) {
    const prompt = installPrompt;
    installPrompt = undefined;
    try { await prompt.prompt(); } finally { if (state === 'home') showHome(false); }
  }
});
$('pause').addEventListener('click',togglePause);
$('sound').addEventListener('click',() => {
  progress.sound = !progress.sound;
  if (progress.sound) playSound();
  syncSound();
  save();
});
document.addEventListener('keydown',event => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'Escape') togglePause();
  if (state === 'battle' && /^[1-7]$/.test(event.key)) tryWeapon(KEYS[Number(event.key)-1]);
});
document.addEventListener('visibilitychange',() => {
  if (document.hidden && state === 'battle') togglePause();
});
window.addEventListener('beforeinstallprompt',event => {
  event.preventDefault();
  installPrompt = event;
  if (state === 'home') showHome(false);
});
window.addEventListener('appinstalled',() => {
  installPrompt = undefined;
  if (state === 'home') showHome(false);
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(error => console.warn('離線快取啟用失敗',error));
}
syncSound();
showHome(false);
requestAnimationFrame(frame);
