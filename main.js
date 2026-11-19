import { LEVELS, RULES, WEAPONS, unlockAt, weaponDamage } from './config.js';
import { advanceBattle, availability, createBattle, useWeapon } from './combat.js';
import { enemyTurn } from './ai.js';
import { drawCastle } from './art.js';
import { drawLandscape } from './backgrounds.js';
import { drawEnemy, enemyName } from './models.js';
import { createMovement } from './movement.js';
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
let battle = createBattle(LEVELS[level]);
let state = '';
let nextEnemy = 0;
let resultDelay = 0;
let introRemaining = 0;
let newlyUnlocked;
const seenBriefings = new Set();
let hintUntil = 0;
let installPrompt;
let previousFrame;

let controls = [];
const movement = createMovement(castles[0],castles[1],$('movement'));
function renderWeapons() {
  $('weapons').style.setProperty('--weapon-count',battle.weapons.length);
  $('weapons').innerHTML = battle.weapons.map((key,i) => {
    const weapon = WEAPONS[key];
    const color = {light:'#f6c667',heavy:'#ff9264',rocket:'#f5908b',bomb:'#ffe690',emp:'#bc9fff',shield:'#69d9ff',repair:'#92e7aa'}[key];
    const detail = weapon.damage ? `傷害 ${weaponDamage(key,battle.level.power)}` : weapon.heal ? `修復 ${weapon.heal} HP` : `減傷 ${Math.round(weapon.reduction*100)}%`;
    return `<button class="weapon" data-weapon="${key}" style="--accent:${color}" aria-label="${weapon.name}，${detail}，消耗 ${weapon.cost} 能量" title="${detail}"><kbd>${i+1}</kbd><span aria-hidden="true" class="icon">${weapon.icon}</span><b>${weapon.name}</b><small class="weapon-detail">${detail}</small><small class="weapon-status"></small><i aria-hidden="true"></i></button>`;
  }).join('');
  controls = battle.weapons.map(key => ({
    key,
    button:document.querySelector(`[data-weapon="${key}"]`),
    crew:document.querySelector(`[data-crew="${key}"]`)
  }));
}
const stats = battle.castles.map((_,i) => ({
  hp:$('hp'+i), bar:$('bar'+i), energy:$('energy'+i), charge:$('charge'+i)
}));
const effects = createEffects($('effects'),castles,movement.offset);
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
  const stage = battle.level;
  $('stage').textContent = `第 ${stage.number} 關`;
  $('area').textContent = stage.name;
  $('enemy-name').textContent = enemyName(stage.enemy);
  document.querySelector('.scenery').innerHTML = drawLandscape(stage.background);
  castles[0].innerHTML = drawCastle(0,battle.weapons);
  castles[1].innerHTML = drawEnemy(stage.enemy,battle.weapons);
  movement.reset();
  renderWeapons();
}
function update() {
  battle.castles.forEach((actor,i) => {
    const view = stats[i];
    view.hp.textContent = `${actor.hp} / ${actor.maxHp} HP`;
    view.bar.style.width = `${100*actor.hp/actor.maxHp}%`;
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
    button.querySelector('.weapon-status').textContent = `⚡${weapon.cost}${remaining > 0 ? ' · '+Math.ceil(remaining)+'秒' : state === 'battle' && reason ? ' · '+reason : ''}`;
    button.querySelector('i').style.width = `${100*(1-remaining/weapon.cooldown)}%`;
  });
  if (hintUntil && battle.time >= hintUntil) {
    hint.textContent = '點武器或城堡隊員出招';
    hintUntil = 0;
  }
}
function setState(mode) {
  state = mode;
  movement.enable(mode === 'battle');
  $('briefing').hidden = mode !== 'intro';
  game.classList.toggle('playing',mode === 'battle' || mode === 'ending');
  overlay.hidden = ['battle','ending','intro'].includes(mode);
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
  battle = createBattle(LEVELS[level]);
  effects.clear();
  hintUntil = 0;
  hint.textContent = '點武器或城堡隊員出招';
  syncLevel();
  setState('home');
  const stages = LEVELS.map(({name,difficulty},i) => `<button class="level" data-level="${i}" aria-label="第 ${i+1} 關，${name}，${difficulty}" aria-pressed="${i===level}" ${i>progress.unlocked?'disabled':''}>${i+1}</button>`).join('');
  showPanel(`<h1 id="panel-title">GearFort</h1>
    <p>${battle.level.name} · ${battle.level.difficulty} · V1.1</p>
    <div class="levels" aria-label="選擇關卡">${stages}</div>
    <div class="actions"><button class="primary" data-action="start">開始戰鬥</button>
    ${installPrompt ? '<button class="secondary" data-action="install">安裝遊戲</button>' : ''}</div>`,focus);
}
function start() {
  battle = createBattle(LEVELS[level]);
  nextEnemy = battle.level.interval;
  previousFrame = undefined;
  effects.clear();
  hintUntil = 0;
  hint.textContent = '點武器或城堡隊員出招';
  if (progress.sound) playSound();
  syncLevel();
  const stage = battle.level;
  const fresh = !seenBriefings.has(stage.number) && stage.number > 1 ? unlockAt(stage.number) : undefined;
  seenBriefings.add(stage.number);
  $('briefing').innerHTML = `<div class="briefing-card"><strong>第 ${stage.number} 關</strong><span>${stage.name}</span>
    <small>攻擊力 ×${stage.power.toFixed(2)} · ${stage.playerHp} HP</small>
    <small>開戰後，輕點前進走一步，按住繼續走</small>
    ${fresh ? weaponNotice(fresh) : ''}</div>`;
  introRemaining = fresh ? 2.2 : 1.25;
  setState('intro');
}
function beginBattle() {
  setState('battle');
  if (!matchMedia('(pointer: coarse)').matches) controls[0].button.focus({preventScroll:true});
}
function tryWeapon(key) {
  if (state !== 'battle' || !key) return;
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
function weaponNotice(key) {
  const weapon = WEAPONS[key];
  const description = weapon.heal ? `修復 ${weapon.heal} HP`
    : weapon.duration ? `${weapon.duration} 秒內減傷 ${Math.round(weapon.reduction*100)}%`
    : weapon.stun ? `讓敵人停火 ${weapon.stun} 秒` : '用控制台或隊員發射';
  return `<div class="unlock"><span aria-hidden="true">${weapon.icon}</span><div><b>解鎖 ${weapon.name}</b><small>${description}</small></div></div>`;
}
function finish() {
  const won = battle.winner === 0;
  const final = level === LEVELS.length - 1;
  const next = won && !final ? LEVELS[level+1] : undefined;
  setState('result');
  showPanel(`<h2 id="panel-title">${won ? (final?'🏆 全關通過！':'🏆 勝利！') : '💪 再試一次！'}</h2>
    <p>${won ? '藍色城堡獲勝' : '戰敗 · 敵方城堡獲勝'}</p>
    <div class="stats"><div><strong>${battle.time.toFixed(1)} 秒</strong>戰鬥時間</div>
    <div><strong>${battle.attacks}</strong>攻擊次數</div><div><strong>${battle.damage}</strong>總傷害</div>
    <div><strong>${battle.castles[0].hp}</strong>剩餘生命</div></div>
    ${next ? `<div class="next-info"><b>第 ${next.number} 關 · ${next.name}</b><small>${enemyName(next.enemy)} · 生命 ${next.playerHp} HP · 攻擊力 ×${next.power.toFixed(2)}（原 ×${battle.level.power.toFixed(2)}）</small></div>` : ''}
    ${newlyUnlocked ? weaponNotice(newlyUnlocked) : ''}
    <div class="actions">${won && !final ? '<button class="primary" data-action="next">下一關</button>' : ''}
    <button class="${won&&!final?'secondary':'primary'}" data-action="start">${won?'再玩一次':'重新挑戰'}</button>
    <button class="secondary" data-action="home">返回首頁</button></div>`);
}
function frame(now) {
  const dt = previousFrame === undefined ? 0 : Math.min(.1,(now-previousFrame)/1000);
  previousFrame = now;
  if (state === 'intro') {
    introRemaining -= dt;
    if (introRemaining <= 0) beginBattle();
  } else if (state === 'battle') {
    movement.tick(dt);
    advanceBattle(battle,dt,emit);
    if (battle.winner !== null) {
      newlyUnlocked = undefined;
      if (battle.winner === 0 && level === progress.unlocked && level+1 < LEVELS.length) {
        progress.unlocked = level+1;
        newlyUnlocked = unlockAt(LEVELS[level+1].number);
        save();
      }
      resultDelay = 0;
      setState('ending');
    } else if (battle.time >= nextEnemy) {
      enemyTurn(battle,emit);
      nextEnemy = battle.time + battle.level.interval;
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

const touchFire = new WeakMap();
game.addEventListener('pointerdown',event => {
  if (event.pointerType !== 'touch' || state !== 'battle') return;
  const button = event.target.closest('[data-weapon],[data-crew]');
  if (!button) return;
  event.preventDefault();
  touchFire.set(button,performance.now());
  tryWeapon(button.dataset.weapon || button.dataset.crew);
});
game.addEventListener('click',async event => {
  const button = event.target.closest('button');
  if (!button) return;
  const {weapon,crew,action,level:selection} = button.dataset;
  if ((weapon || crew) && event.pointerType !== 'touch'
      && (!event.detail || performance.now() - (touchFire.get(button) ?? -Infinity) > 700)) {
    tryWeapon(weapon || crew);
  }
  if (selection !== undefined) {
    if (Number(selection) > progress.unlocked) return;
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
  if (state === 'battle' && /^[1-7]$/.test(event.key)) tryWeapon(battle.weapons[Number(event.key)-1]);
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
