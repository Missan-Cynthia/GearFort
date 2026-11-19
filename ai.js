import { DIFFICULTIES, WEAPONS } from './config.js';
import { availability, useWeapon } from './combat.js';

export function enemyTurn(battle, emit, random = Math.random) {
  const policy = DIFFICULTIES[battle.level.difficulty];
  const actor = battle.castles[1];
  const ready = key => !availability(battle,1,key);
  const fire = key => useWeapon(battle,1,key,emit);
  const incoming = battle.pending.find(shot => shot.side === 0);
  if (incoming && actor.shieldUntil <= battle.time && ready('shield')) {
    const urgent = !policy.reserve || WEAPONS[incoming.key].damage >= WEAPONS.heavy.damage || actor.hp < actor.maxHp*.2;
    if (urgent && random() < policy.shieldChance) return fire('shield');
  }
  if (actor.hp <= actor.maxHp * policy.repairAt && ready('repair')) return fire('repair');
  const options = battle.weapons.filter(key => WEAPONS[key].damage && ready(key));
  if (policy.reserve) {
    if (ready('bomb')) return fire('bomb');
    if (ready('rocket')) return fire('rocket');
    if (battle.pending.some(shot => shot.side === 1) && ready('emp')) return fire('emp');
    const saving = (actor.ready.bomb ?? 0) <= battle.time + policy.reserve;
    if (saving && actor.energy < WEAPONS.bomb.cost) return false;
    if (ready('heavy')) return fire('heavy');
  }
  return options.length ? fire(options[Math.floor(random() * options.length)]) : false;
}
