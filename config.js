export const RULES = Object.freeze({ energy: 100, regen: 12 });

export const WEAPONS = Object.freeze({
  light:  { name:'小型火砲', crew:'火砲手', icon:'💥', damage:50, cost:10, cooldown:1, flight:.42 },
  heavy:  { name:'大型火砲', crew:'重砲手', icon:'💣', damage:120, cost:25, cooldown:4, flight:.68 },
  rocket: { name:'火箭飛彈', crew:'飛彈手', icon:'🚀', damage:180, cost:35, cooldown:6, flight:.86 },
  bomb:   { name:'天空炸彈', crew:'空軍指揮官', icon:'✈️', damage:250, cost:60, cooldown:12, flight:1.65 },
  emp:    { name:'電磁攻擊', crew:'電磁工程師', icon:'⚡', damage:60, cost:30, cooldown:8, flight:.28, stun:2 },
  shield: { name:'防禦護盾', crew:'防禦工程師', icon:'🛡️', cost:25, cooldown:8, duration:3, reduction:.7 },
  repair: { name:'維修機器人', crew:'維修工程師', icon:'🤖', cost:35, cooldown:12, heal:100 }
});

export const KEYS = Object.keys(WEAPONS);
export const UNLOCKS = [
  ['light',1], ['heavy',2], ['repair',3], ['shield',4], ['rocket',5], ['emp',6], ['bomb',7]
];

export const MOVEMENT = Object.freeze({ speed:190, step:26, wall:4, gap:18 });

export const DIFFICULTIES = {
  '簡單': { shieldChance:0, repairAt:0 },
  '普通': { shieldChance:.35, repairAt:.48 },
  '困難': { shieldChance:.75, repairAt:.55, reserve:1.5 }
};

export const LEVELS = [
  { number:1, name:'晨風草原', background:'meadow', enemy:'scout', playerHp:1000, enemyHp:1000, power:1, enemyPower:.56, interval:4.6, difficulty:'簡單' },
  { number:2, name:'黃金沙漠', background:'desert', enemy:'crawler', playerHp:1250, enemyHp:1200, power:1.12, enemyPower:.64, interval:4, difficulty:'簡單' },
  { number:3, name:'神秘森林', background:'forest', enemy:'timber', playerHp:1500, enemyHp:1500, power:1.28, enemyPower:.76, interval:3.35, difficulty:'簡單' },
  { number:4, name:'冰雪山脈', background:'snow', enemy:'spire', playerHp:1800, enemyHp:1850, power:1.47, enemyPower:.94, interval:2.85, difficulty:'普通' },
  { number:5, name:'岩石峽谷', background:'canyon', enemy:'bulwark', playerHp:2150, enemyHp:2250, power:1.69, enemyPower:1.1, interval:2.45, difficulty:'普通' },
  { number:6, name:'海岸戰場', background:'coast', enemy:'ironclad', playerHp:2500, enemyHp:2700, power:1.93, enemyPower:1.26, interval:2.1, difficulty:'普通' },
  { number:7, name:'霧光沼澤', background:'marsh', enemy:'walker', playerHp:2900, enemyHp:3250, power:2.19, enemyPower:1.42, interval:1.83, difficulty:'困難' },
  { number:8, name:'古城廢墟', background:'ruins', enemy:'citadel', playerHp:3350, enemyHp:3850, power:2.48, enemyPower:1.62, interval:1.62, difficulty:'困難' },
  { number:9, name:'熔岩火山', background:'volcano', enemy:'forge', playerHp:3850, enemyHp:4550, power:2.8, enemyPower:1.84, interval:1.43, difficulty:'困難' },
  { number:10, name:'機械都市', background:'city', enemy:'titan', playerHp:4450, enemyHp:5400, power:3.16, enemyPower:2.1, interval:1.25, difficulty:'困難' }
];

export function weaponsFor(number) {
  return UNLOCKS.filter(([,unlock]) => unlock <= number).map(([key]) => key);
}
export function unlockAt(number) {
  return UNLOCKS.find(([,unlock]) => unlock === number)?.[0];
}
export function weaponDamage(key, power) {
  return Math.round(WEAPONS[key].damage * power);
}
