import test from 'node:test';
import assert from 'node:assert/strict';
import { KEYS, LEVELS, RULES, WEAPONS } from './config.js';
import { advanceBattle, availability, createBattle, useWeapon } from './combat.js';
import { enemyTurn } from './ai.js';

test('all seven weapons use the shared energy and cooldown rules on both sides', () => {
  for (const side of [0,1]) for (const key of KEYS) {
    const battle = createBattle();
    const actor = battle.castles[side];
    const target = battle.castles[1-side];
    const weapon = WEAPONS[key];
    actor.hp -= 150;
    const events = [];
    assert.equal(useWeapon(battle,side,key,event => events.push(event)),true);
    assert.equal(actor.energy,RULES.energy-weapon.cost);
    assert.equal(useWeapon(battle,side,key),false);
    assert.equal(events[0].key,key);
    if (weapon.damage) {
      assert.equal(target.hp,RULES.hp);
      advanceBattle(battle,weapon.flight);
      assert.equal(target.hp,RULES.hp-weapon.damage);
    } else if (weapon.heal) {
      assert.equal(actor.hp,RULES.hp-150+weapon.heal);
    } else {
      assert.equal(actor.shieldUntil,weapon.duration);
    }
  }
});

test('shield cuts sky bomb damage on impact and expires', () => {
  const battle = createBattle();
  useWeapon(battle,0,'bomb');
  advanceBattle(battle,.5);
  useWeapon(battle,1,'shield');
  advanceBattle(battle,2);
  assert.equal(battle.castles[1].hp,925);
  advanceBattle(battle,2);
  useWeapon(battle,0,'light');
  advanceBattle(battle,1);
  assert.equal(battle.castles[1].hp,875);
});

test('EMP blocks attacks for two seconds while allowing defense and repair', () => {
  const battle = createBattle();
  useWeapon(battle,0,'emp');
  advanceBattle(battle,WEAPONS.emp.flight);
  assert.equal(availability(battle,1,'heavy'),'電磁干擾');
  assert.ok(useWeapon(battle,1,'shield'));
  assert.ok(useWeapon(battle,1,'repair'));
  assert.equal(battle.castles[1].hp,RULES.hp);
  advanceBattle(battle,2);
  assert.ok(useWeapon(battle,1,'light'));
});

test('energy cannot go negative and regenerates to its cap', () => {
  const battle = createBattle();
  assert.ok(useWeapon(battle,0,'bomb'));
  assert.ok(useWeapon(battle,0,'rocket'));
  assert.equal(availability(battle,0,'light'),'能量不足');
  advanceBattle(battle,.5);
  assert.ok(useWeapon(battle,0,'light'));
  assert.equal(battle.castles[0].energy,0);
  advanceBattle(battle,100);
  assert.equal(battle.castles[0].energy,RULES.energy);
});

test('lethal impacts finalize exactly once and record actual player statistics', () => {
  for (const winner of [0,1]) {
    const battle = createBattle();
    battle.castles[1-winner].hp = 30;
    useWeapon(battle,winner,'light');
    advanceBattle(battle,2);
    assert.equal(battle.winner,winner);
    assert.equal(battle.time,WEAPONS.light.flight);
    assert.equal(battle.castles[1-winner].hp,0);
    assert.equal(battle.attacks,winner===0 ? 1 : 0);
    assert.equal(battle.damage,winner===0 ? 30 : 0);
    assert.equal(useWeapon(battle,winner,'light'),false);
    advanceBattle(battle,2);
    assert.equal(battle.time,WEAPONS.light.flight);
  }
});

test('all ten AI levels can win against an idle player and obey limits', () => {
  for (let level=0;level<LEVELS.length;level++) {
    const battle = createBattle();
    const interval = LEVELS[level][2];
    const last = {};
    for (let turn=0;turn<200 && battle.winner===null;turn++) {
      advanceBattle(battle,interval);
      if (battle.winner!==null) break;
      const before = battle.castles[1].energy;
      enemyTurn(battle,level,event => {
        if(event.type !== 'fire') return;
        const weapon = WEAPONS[event.key];
        assert.ok(before+1e-8 >= weapon.cost);
        assert.ok(event.time+1e-8 >= (last[event.key] ?? -Infinity)+weapon.cooldown);
        last[event.key] = event.time;
      },() => .42);
    }
    assert.equal(battle.winner,1);
  }
});
