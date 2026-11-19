import { LEVELS, RULES, WEAPONS, weaponsFor } from './config.js';
import { attackEligibility } from './eligibility.js';
import { repairCastle, resolveImpact } from './damage.js';

function castle(hp, power) {
  return { hp, maxHp:hp, power, energy:RULES.energy, ready:{}, shieldUntil:0, stunUntil:0 };
}

export function createBattle(level = LEVELS[0]) {
  return { level, weapons:weaponsFor(level.number), castles:[castle(level.playerHp,level.power),castle(level.enemyHp,level.enemyPower)], time:0, pending:[], attacks:0, damage:0, winner:null };
}

export function availability(battle, side, key) {
  const actor = battle.castles[side];
  const weapon = WEAPONS[key];
  if (!weapon || battle.winner !== null) return '戰鬥結束';
  if (!battle.weapons.includes(key)) return '尚未解鎖';
  if (weapon.damage && actor.stunUntil > battle.time) return '電磁干擾';
  if ((actor.ready[key] ?? 0) > battle.time) return '冷卻中';
  if (actor.energy + 1e-8 < weapon.cost) return '能量不足';
  if (weapon.heal && actor.hp === actor.maxHp) return '生命已滿';
  return '';
}

export function useWeapon(battle, side, key, emit = () => {}) {
  if (availability(battle,side,key)) return false;
  const weapon = WEAPONS[key];
  const qualification = weapon.damage ? attackEligibility({battle,side,key}) : {allowed:true};
  if (!qualification.allowed) return false;

  const actor = battle.castles[side];
  actor.energy = Math.max(0, actor.energy - weapon.cost);
  actor.ready[key] = battle.time + weapon.cooldown;
  emit({ type:'fire', side, key, time:battle.time });
  if (weapon.damage) {
    if (side === 0) battle.attacks++;
    battle.pending.push({ side,key,due:battle.time + weapon.flight,multiplier:actor.power * (qualification.multiplier ?? 1) });
    battle.pending.sort((a,b) => a.due - b.due);
  } else if (weapon.heal) {
    emit({type:'heal',side,amount:repairCastle(actor,weapon),time:battle.time});
  } else {
    actor.shieldUntil = battle.time + weapon.duration;
  }
  return true;
}

export function advanceBattle(battle, seconds, emit = () => {}) {
  if (battle.winner !== null) return;
  const end = battle.time + seconds;
  function advanceClock(time) {
    for (const actor of battle.castles) {
      actor.energy = Math.min(RULES.energy, actor.energy + (time - battle.time) * RULES.regen);
    }
    battle.time = time;
  }
  while (battle.pending[0]?.due <= end) {
    const {side,key,due,multiplier} = battle.pending.shift();
    advanceClock(due);
    const targetSide = 1 - side;
    const target = battle.castles[targetSide];
    const shielded = target.shieldUntil > due;
    const amount = resolveImpact(target,WEAPONS[key],due,multiplier);
    if (side === 0) battle.damage += amount;
    emit({type:'hit',side:targetSide,key,amount,shielded,time:due});
    if (target.hp === 0) {
      battle.winner = side;
      battle.pending.length = 0;
      return;
    }
  }
  advanceClock(end);
}
