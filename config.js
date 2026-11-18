export const RULES = Object.freeze({ hp: 1000, energy: 100, regen: 10 });

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
export const LEVELS = [
  ['晨風草原','簡單',2.7], ['齒輪山丘','簡單',2.35], ['琥珀峽谷','簡單',2.05],
  ['星光林地','普通',1.8], ['飛石高原','普通',1.6], ['紫霧山谷','普通',1.4],
  ['風暴前線','困難',1.18], ['赤霞關口','困難',1.04], ['極光山脊','困難',.91],
  ['天空王座','困難',.8]
];
