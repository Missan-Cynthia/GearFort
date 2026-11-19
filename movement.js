import { MOVEMENT } from './config.js';

export function moveCastle(position, direction, seconds, bounds) {
  const left = Math.min(bounds.start, MOVEMENT.wall);
  const right = Math.max(left, bounds.enemy - bounds.width - MOVEMENT.gap);
  return Math.max(left, Math.min(right, position + direction * MOVEMENT.speed * seconds));
}

export function stepCastle(position, direction, bounds) {
  return moveCastle(position,direction,MOVEMENT.step/MOVEMENT.speed,bounds);
}

export function createMovement(player, enemy, controls) {
  const pointers = new Map();
  const label = controls.querySelector('b');
  const keys = new Map();
  const arrows = { ArrowLeft:-1, ArrowRight:1 };
  let position;
  let enabled = false;
  const bounds = () => ({ start:player.offsetLeft, width:player.offsetWidth, enemy:enemy.offsetLeft });
  const direction = () => Math.sign([...pointers.values(), ...keys.values()].reduce((sum,value) => sum+value,0));

  function clear() {
    pointers.clear();
    keys.clear();
    player.classList.remove('moving','backward');
    controls.querySelectorAll('button').forEach(button => button.removeAttribute('data-held'));
  }
  function place(next) {
    position = next;
    player.style.translate = `${position - player.offsetLeft}px 0`;
    const limits = bounds();
    label.textContent = position >= moveCastle(Infinity,0,0,limits) ? '已到前線' : '城堡移動';
  }

  function nudge(direction) {
    place(stepCastle(position ?? player.offsetLeft,direction,bounds()));
  }
  const observer = new ResizeObserver(() => {
    if (position !== undefined) place(moveCastle(position,0,0,bounds()));
  });
  observer.observe(player.parentElement);
  observer.observe(player);
  observer.observe(enemy);

  for (const button of controls.querySelectorAll('button')) {
    button.addEventListener('pointerdown',event => {
      if (!enabled || event.button !== 0) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      const direction = Number(button.dataset.move);
      pointers.set(event.pointerId,direction);
      nudge(direction);
      button.dataset.held = '';
    });
    for (const type of ['pointerup','pointercancel','lostpointercapture']) {
      button.addEventListener(type,event => {
        pointers.delete(event.pointerId);
        if (![...pointers.values()].includes(Number(button.dataset.move))) button.removeAttribute('data-held');
      });
    }
    button.addEventListener('click',event => {
      if (enabled && event.detail === 0 && !event.pointerType) nudge(Number(button.dataset.move));
    });
    button.addEventListener('keydown',event => {
      if (!enabled || ![' ','Enter'].includes(event.key)) return;
      event.preventDefault();
      if (!event.repeat) {
        const direction = Number(button.dataset.move);
        keys.set(event.key,direction);
        nudge(direction);
      }
    });
    button.addEventListener('keyup',event => {
      if ([' ','Enter'].includes(event.key)) keys.delete(event.key);
    });
    button.addEventListener('blur',() => { keys.delete(' '); keys.delete('Enter'); });
  }
  document.addEventListener('keydown',event => {
    if (!enabled || !arrows[event.key] || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    if (!event.repeat) {
      keys.set(event.key,arrows[event.key]);
      nudge(arrows[event.key]);
    }
  });
  document.addEventListener('keyup',event => keys.delete(event.key));
  window.addEventListener('blur',clear);
  return {
    enable(value) {
      enabled = value;
      if (!value) clear();
      controls.querySelectorAll('button').forEach(button => { button.disabled = !value; });
    },
    reset() {
      clear();
      place(moveCastle(player.offsetLeft,0,0,bounds()));
    },
    tick(seconds) {
      const current = position ?? player.offsetLeft;
      const next = moveCastle(current,direction(),seconds,bounds());
      if (next !== current) place(next);
      player.classList.toggle('moving',next !== current);
      player.classList.toggle('backward',next < current);
    },
    offset() { return (position ?? player.offsetLeft) - player.offsetLeft; }
  };
}
