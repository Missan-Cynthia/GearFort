import { WEAPONS } from './config.js';

export function resolveImpact(target, weapon, time, multiplier) {
  const factor = target.shieldUntil > time ? 1 - WEAPONS.shield.reduction : 1;
  const damage = Math.min(target.hp, Math.round(weapon.damage * factor * multiplier));
  target.hp -= damage;
  if (weapon.stun) target.stunUntil = Math.max(target.stunUntil, time + weapon.stun);
  return damage;
}

export function repairCastle(target, weapon) {
  const healed = Math.min(weapon.heal, target.maxHp - target.hp);
  target.hp += healed;
  return healed;
}
