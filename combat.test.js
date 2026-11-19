import test from 'node:test';
import assert from 'node:assert/strict';
import { KEYS, LEVELS, RULES, WEAPONS, weaponsFor, weaponDamage } from './config.js';
import { availability, advanceBattle, createBattle, useWeapon } from './combat.js';
import { enemyTurn } from './ai.js';
import { drawLandscape } from './backgrounds.js';
import { drawEnemy } from './models.js';
import { moveCastle, stepCastle } from './movement.js';

const maxStage = LEVELS.at(-1);
const equalPowerStage = {...maxStage, playerHp:1000, enemyHp:1000, power:1, enemyPower:1};

test('all 10 stages have unique scenery and hull geometry, rising HP and damage, and cumulative unlocks', () => {
  const backgrounds = new Set();
  const hulls = new Set();
  const first = LEVELS[0];
  assert.equal(first.playerHp,1000);
  assert.equal(first.enemyHp,1000);
  for (const [i,level] of LEVELS.entries()) {
    assert.equal(level.number,i+1);
    const battle = createBattle(level);
    assert.deepEqual(battle.castles.map(actor=>actor.hp),[level.playerHp,level.enemyHp]);
    assert.equal(battle.weapons.length,Math.min(i+1,KEYS.length));
    assert.equal(new Set(battle.weapons).size,battle.weapons.length);
    const background = drawLandscape(level.background);
    const hull = drawEnemy(level.enemy,battle.weapons).match(/<path d="([^"]+)" fill="url\(#enemy-plate\)"/)[1];
    assert.ok(!backgrounds.has(background));
    assert.ok(!hulls.has(hull));
    assert.equal(drawLandscape(level.background),background);
    assert.equal(drawEnemy(level.enemy,battle.weapons),drawEnemy(level.enemy,weaponsFor(level.number)));
    backgrounds.add(background);
    hulls.add(hull);
    if (!i) continue;
    const previous = LEVELS[i-1];
    assert.ok(level.playerHp > previous.playerHp && level.enemyHp > previous.enemyHp);
    for (const key of weaponsFor(previous.number)) {
      assert.ok(battle.weapons.includes(key));
      if (WEAPONS[key].damage) assert.ok(weaponDamage(key,level.power) > weaponDamage(key,previous.power));
    }
  }
});

test('locked weapons cannot fire on either team or consume energy', () => {
  const battle = createBattle();
  for (const side of [0,1]) {
    assert.equal(availability(battle,side,'bomb'),'尚未解鎖');
    assert.ok(!useWeapon(battle,side,'bomb'));
    assert.equal(battle.castles[side].energy,RULES.energy);
  }
});

test('all seven weapons obey shared energy and cooldown on both sides', () => {
  for (const side of [0,1]) for (const key of KEYS) {
    const battle = createBattle(maxStage);
    const actor = battle.castles[side];
    const target = battle.castles[1-side];
    const weapon = WEAPONS[key];
    actor.hp -= 150;
    assert.ok(useWeapon(battle,side,key));
    assert.equal(actor.energy,RULES.energy-weapon.cost);
    assert.ok(!useWeapon(battle,side,key));
    if (weapon.damage) {
      assert.equal(target.hp,target.maxHp);
      advanceBattle(battle,weapon.flight);
      assert.equal(target.hp,target.maxHp-weaponDamage(key,actor.power));
    } else if (weapon.heal) {
      assert.equal(actor.hp,actor.maxHp-150+weapon.heal);
    } else {
      assert.equal(actor.shieldUntil,weapon.duration);
    }
  }
});

test('shield cuts sky bomb damage and expires; repair caps at the current stage max HP', () => {
  const battle = createBattle(equalPowerStage);
  useWeapon(battle,0,'bomb');
  advanceBattle(battle,.5);
  useWeapon(battle,1,'shield');
  advanceBattle(battle,2);
  assert.equal(battle.castles[1].hp,925);
  assert.ok(useWeapon(battle,1,'repair'));
  assert.equal(battle.castles[1].hp,1000);
  advanceBattle(battle,2);
  useWeapon(battle,0,'light');
  advanceBattle(battle,1);
  assert.equal(battle.castles[1].hp,950);
});

test('EMP blocks attacks for two seconds while allowing defense and repair', () => {
  const battle = createBattle(maxStage);
  useWeapon(battle,0,'emp');
  advanceBattle(battle,WEAPONS.emp.flight);
  assert.equal(availability(battle,1,'heavy'),'電磁干擾');
  assert.ok(useWeapon(battle,1,'shield'));
  assert.ok(useWeapon(battle,1,'repair'));
  advanceBattle(battle,2);
  assert.ok(useWeapon(battle,1,'light'));
});

test('energy stays within limits and regenerates at the configured rate', () => {
  const battle = createBattle(maxStage);
  assert.ok(useWeapon(battle,0,'bomb'));
  assert.ok(useWeapon(battle,0,'rocket'));
  assert.equal(availability(battle,0,'light'),'能量不足');
  advanceBattle(battle,.5);
  assert.ok(useWeapon(battle,0,'light'));
  assert.equal(battle.castles[0].energy,5+.5*RULES.regen-10);
  advanceBattle(battle,100);
  assert.equal(battle.castles[0].energy,RULES.energy);
});

test('lethal impact finalizes either outcome and records effective player damage', () => {
  for (const winner of [0,1]) {
    const battle = createBattle(equalPowerStage);
    battle.castles[1-winner].hp = 30;
    useWeapon(battle,winner,'light');
    advanceBattle(battle,2);
    assert.equal(battle.winner,winner);
    assert.equal(battle.time,WEAPONS.light.flight);
    assert.equal(battle.attacks,winner===0 ? 1 : 0);
    assert.equal(battle.damage,winner===0 ? 30 : 0);
    assert.ok(!useWeapon(battle,winner,'light'));
    advanceBattle(battle,2);
    assert.equal(battle.time,WEAPONS.light.flight);
  }
});

test('movement stops on release and clamps both sides without overlapping the enemy', () => {
  const bounds = { start:28,width:240,enemy:590 };
  assert.ok(moveCastle(28,1,.2,bounds)>28);
  assert.equal(stepCastle(28,1,bounds),54);
  assert.equal(stepCastle(54,-1,bounds),28);
  assert.equal(stepCastle(328,1,bounds),332);
  assert.equal(moveCastle(120,0,1,bounds),120);
  assert.equal(moveCastle(120,-1,999,bounds),4);
  assert.equal(moveCastle(120,1,999,bounds),332);
  assert.equal(moveCastle(342,0,0,{...bounds,enemy:420}),162);
});

function simulate(level, playerInterval, chooseWeapon, seed = 12) {
  const battle = createBattle(level);
  let nextEnemy = level.interval;
  let nextPlayer = .5;
  const random = () => {
    seed = (Math.imul(1664525,seed)+1013904223) >>> 0;
    return seed/2**32;
  };
  for (let tick=0;tick<16000 && battle.winner===null;tick++) {
    advanceBattle(battle,.05);
    if (battle.time >= nextPlayer) {
      for (const key of chooseWeapon(battle)) if (useWeapon(battle,0,key)) break;
      nextPlayer += playerInterval;
    }
    if (battle.time >= nextEnemy) {
      const before = battle.castles[1].energy;
      enemyTurn(battle,event=>{
        if(event.type === 'fire') {
          assert.ok(battle.weapons.includes(event.key));
          assert.ok(before+1e-8>=WEAPONS[event.key].cost);
        }
      },random);
      nextEnemy += level.interval;
    }
  }
  return battle;
}

test('the first two stages are winnable with one tap every 2.2 seconds', () => {
  for (const level of LEVELS.slice(0,2)) {
    for (let seed=0;seed<24;seed++) {
      const battle = simulate(level,2.2,()=>['light'],seed);
      assert.equal(battle.winner,0);
      assert.ok(battle.time < 48);
      assert.ok(battle.castles[0].hp >= .4*level.playerHp);
    }
  }
});

test('all stages support winning, and idle players eventually lose', () => {
  for (const level of LEVELS) {
    const win = simulate(level,.53,battle => {
      const incoming = battle.pending.some(shot=>shot.side===1 && WEAPONS[shot.key].damage>=WEAPONS.rocket.damage);
      const hurt = battle.castles[0].hp < battle.castles[0].maxHp - 200;
      return [...(incoming ? ['shield'] : []),...(hurt ? ['repair'] : []),'bomb','rocket','heavy','emp','light'];
    });
    assert.equal(win.winner,0,`stage ${level.number}`);
    assert.ok(win.time >= 12 && win.time <= 100,`stage ${level.number}: ${win.time}`);
    assert.equal(simulate(level,1,()=>[]).winner,1);
  }
});
