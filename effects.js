import { WEAPONS } from './config.js';

const COLORS = { light:'#ffd494',heavy:'#ff8b50',rocket:'#ff6048',bomb:'#ffb245',emp:'#aa99ff',shield:'#7be8ff',repair:'#8df593' };

export function createEffects(canvas, castles, playerOffset = () => 0) {
  const ctx = canvas.getContext('2d');
  const effects = [];
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(2,window.devicePixelRatio || 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio,0,0,ratio,0,0);
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  function point(side, muzzle = false) {
    const castle = castles[side];
    const fraction = muzzle ? .88 : .52;
    return [
      castle.offsetLeft + (side === 0 ? playerOffset() : 0) + castle.offsetWidth * (side === 0 ? fraction : 1-fraction),
      castle.offsetTop + castle.offsetHeight * (muzzle ? .54 : .55)
    ];
  }
  function circle(x,y,r,color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }
  function label(text,x,y,color) {
    ctx.font = '900 23px system-ui';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#192837';
    ctx.fillStyle = color;
    ctx.strokeText(text,x,y);
    ctx.fillText(text,x,y);
  }
  function projectile(event,p) {
    const {side,key} = event;
    const [x,y] = event.origin;
    const [tx,ty] = point(1-side);
    const dir = side === 0 ? 1 : -1;
    const px = x + (tx-x)*p;
    const py = y + (ty-y)*p - Math.sin(p*Math.PI)*(key === 'rocket' ? height*.27 : 12);
    if (key === 'bomb') {
      const planeX = side === 0 ? -48 + (width+96)*p : width+48-(width+96)*p;
      const planeY = height*.19;
      ctx.save();
      ctx.translate(planeX,planeY);
      ctx.scale(dir,1);
      ctx.fillStyle = '#30475d';
      ctx.beginPath();
      ctx.moveTo(-26,-6); ctx.lineTo(-18,5); ctx.lineTo(-8,5); ctx.lineTo(-18,16);
      ctx.lineTo(-6,16); ctx.lineTo(8,5); ctx.lineTo(25,5); ctx.quadraticCurveTo(39,-4,19,-6);
      ctx.lineTo(8,-6); ctx.lineTo(-4,-17); ctx.lineTo(-14,-17); ctx.lineTo(-7,-6);
      ctx.closePath(); ctx.fill();
      circle(17,-3,3,'#97e9ff');
      ctx.restore();
      const release = side === 0 ? (tx+48)/(width+96) : (width+48-tx)/(width+96);
      if (p >= release) {
        const fall = (p-release)/(1-release);
        const bombY = planeY + (ty-planeY)*fall**2;
        circle(tx,bombY,11,'#2b3444');
        circle(tx,bombY-8,4,'#ffdd72');
      }
      return;
    }
    if (key === 'emp') {
      ctx.strokeStyle = COLORS.emp; ctx.lineWidth = 6;
      ctx.shadowColor = '#605bff'; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.moveTo(x,y);
      for(let i=1;i<10;i++) ctx.lineTo(x+(tx-x)*i/10,y+Math.sin(i*4+p*18)*14);
      ctx.lineTo(tx,ty); ctx.stroke(); ctx.shadowBlur = 0;
      return;
    }
    if (key === 'rocket') {
      for(let i=7;i>=1;i--) {
        const trail = Math.max(0,p-i*.023);
        ctx.globalAlpha = .46-i*.045;
        circle(x+(tx-x)*trail,y+(ty-y)*trail-Math.sin(trail*Math.PI)*height*.27,4+i*1.5,'#f9eddb');
      }
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(px,py);
      ctx.scale(dir,1);
      ctx.fillStyle = '#ff9b53'; ctx.fillRect(-25,-3,16,6);
      ctx.fillStyle = '#f6e6c6'; ctx.fillRect(-12,-5,23,10);
      ctx.fillStyle = '#e75c47'; ctx.beginPath(); ctx.moveTo(10,-5);ctx.lineTo(20,0);ctx.lineTo(10,5);ctx.fill();
      ctx.restore();
      return;
    }
    const r = key === 'heavy' ? 13 : 7;
    circle(px,py,r,COLORS[key]);
    circle(px,py,r*.65,'#414454');
  }
  function impact(event,p) {
    const [x,y] = point(event.side);
    ctx.globalAlpha = 1-p;
    if (event.type === 'heal') {
      ctx.font = '35px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('🤖',x-32,y+24-p*15);
      for(let i=0;i<6;i++) circle(x+(i-2.5)*12,y+17-Math.sin(i*2)*14-p*45,3,COLORS.repair);
      label('+'+event.amount,x,y-12-p*32,COLORS.repair);
    } else {
      const scale = event.key === 'bomb' ? 1.7 : event.key === 'heavy' ? 1.3 : 1;
      for(let i=0;i<10;i++){
        const angle = i*2.4;
        const reach = (14+p*45)*scale;
        const sx = x+Math.cos(angle)*reach;
        const sy = y+Math.sin(angle)*reach;
        const color = event.shielded ? COLORS.shield : COLORS[event.key];
        circle(sx,sy,Math.max(1,(9-p*7)*scale),p<.42 ? color : '#647184');
        if (i%2===0 && !event.shielded) {
          ctx.fillStyle = '#354356';
          ctx.fillRect(sx,sy+p*p*58,5,4);
        }
      }
      label('−'+event.amount,x,y-15-p*40,event.shielded ? COLORS.shield : '#fff0b8');
    }
    ctx.globalAlpha = 1;
  }

  return {
    add(event) {
      if (event.type === 'hit' || (event.type === 'fire' && WEAPONS[event.key].damage)) {
        const element = castles[event.side];
        const className = event.type === 'hit' ? 'hit' : event.key === 'heavy' ? 'recoil' : '';
        if (className) {
          element.classList.remove('hit','recoil');
          void element.offsetWidth;
          element.classList.add(className);
        }
      }
      if (event.type !== 'fire') effects.push(event);
      else if (WEAPONS[event.key].flight) effects.push({ ...event, origin:point(event.side,true) });
    },
    clear() { effects.length = 0; ctx.clearRect(0,0,width,height); },
    render(battle,time = battle.time) {
      ctx.clearRect(0,0,width,height);
      battle.castles.forEach((castle,side) => {
        const [x,y] = point(side);
        const body = castles[side];
        if (castle.shieldUntil > battle.time) {
          ctx.fillStyle = '#65e6ff44'; ctx.strokeStyle = '#b3f7ff'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(x,y,Math.max(1,body.offsetWidth*.44),Math.max(1,body.offsetHeight*.41),0,0,Math.PI*2);
          ctx.fill(); ctx.stroke();
        }
        if (castle.stunUntil > battle.time) label('ϟ',x,y-body.offsetHeight*.33,COLORS.emp);
      });
      for (let i=effects.length-1;i>=0;i--) {
        const event = effects[i];
        const duration = event.type === 'fire' ? WEAPONS[event.key].flight : .86;
        const progress = (time-event.time)/duration;
        if (progress >= 1) effects.splice(i,1);
        else if (event.type === 'fire') projectile(event,Math.max(0,progress));
        else impact(event,Math.max(0,progress));
      }
    }
  };
}
