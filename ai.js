import { KEYS, LEVELS, RULES, WEAPONS } from './config.js';
import { availability, useWeapon } from './combat.js';

export function enemyTurn(battle, level, emit, random = Math.random) {
  const mode = LEVELS[level][1];
  const actor = battle.castles[1];
  const ready = key => !availability(battle,1,key);
  const fire = key => useWeapon(battle,1,key,emit);
  const incoming = battle.pending.find(shot => shot.side === 0);
  if (incoming && actor.shieldUntil <= battle.time && ready('shield')) {
    const chance = mode === '簡單' ? .12 : mode === '普通' ? .55 : .95;
    if ((mode !== '困難' || WEAPONS[incoming.key].damage >= WEAPONS.heavy.damage || actor.hp < 200) && random() < chance) {
      return fire('shield');
    }
  }
  if (mode !== '簡單' && actor.hp <= RULES.hp * .55 && ready('repair')) return fire('repair');
  const options = KEYS.filter(key => WEAPONS[key].damage && ready(key));
  if (mode === '困難') {
    if (ready('bomb')) return fire('bomb');
    if (actor.energy >= 45 && ready('rocket')) return fire('rocket');
    if (battle.pending.some(shot => shot.side === 1) && ready('emp')) return fire('emp');
    const savingForBomb = (actor.ready.bomb ?? 0) <= battle.time + 2;
    if (savingForBomb && actor.energy < WEAPONS.bomb.cost) return false;
    if (ready('heavy')) return fire('heavy');
  }
  return options.length ? fire(options[Math.floor(random() * options.length)]) : false;
}
