import { WEAPONS } from './config.js';

const models = {
  scout: {
    name:'紅旗斥候', colors:['#d87059','#923e3e','#f5c67a'], drive:'wheels',
    hull:'M64 210l17-58h177l28 58v29H64z', tower:'M125 154v-49h69v49z',
    trim:'M132 106v-15h56v15', gun:[133,129,5,1], flag:[160,90], windows:[[151,129],[232,179]]
  },
  crawler: {
    name:'沙丘履帶堡', colors:['#c99155','#874b3c','#f2cf8c'], drive:'tracks',
    hull:'M53 228l26-60 45-21h130l39 73-24 20H65z', tower:'M138 150l-16-33 21-27h75l25 35-9 25z',
    trim:'M77 186h183m-193 29h207', gun:[126,118,9,1], flag:[187,90], windows:[[165,120],[199,120],[113,191]]
  },
  timber: {
    name:'森野巨輪堡', colors:['#9b7051','#624838','#d6d18d'], drive:'giant',
    hull:'M63 230l-6-66 30-19 154 2 56 22-13 66z', tower:'M110 147V96l26-20h36l29 23v48zM213 145v-24h47v28z',
    trim:'M76 173h192m-178 20h161m-161 19h153', gun:[117,127,6,1], flag:[158,75], windows:[[153,106],[95,166],[234,131]]
  },
  spire: {
    name:'霜晶尖塔', colors:['#89afcf','#4a7398','#dbf6ff'], drive:'sled',
    hull:'M66 226l26-68 42-13h87l54 31 20 52-43 13H97z', tower:'M111 149V93l33-62 31 61v57zm83 0v-49l25-41 25 38v62z',
    trim:'M144 43v49m74-19v27m-128 90h173', gun:[106,111,7,2], flag:[144,40], windows:[[144,108],[219,114],[169,181]]
  },
  bulwark: {
    name:'峽谷重甲堡', colors:['#a86754','#634b56','#e5ae78'], drive:'tracks',
    hull:'M46 224l21-69 40-19h155l39 32 12 67-35 10H70z', tower:'M96 141V89l25-13h22l17 17h45l16-26 31 7 11 66z',
    trim:'M71 169h206m-209 43h218m-160-65-18 82m132-84 18 83', gun:[110,116,10,2], flag:[231,70], windows:[[141,103],[224,100],[110,183],[213,182]]
  },
  ironclad: {
    name:'海岸鐵甲艦', colors:['#6495a6','#3d5971','#f3c48d'], drive:'float',
    hull:'M43 192h259l-24 49H99Q64 229 43 192z', tower:'M95 193v-56h50v-39h52v32h49l33 63z',
    trim:'M57 204h228m-207 18h197m-100-126V52h33', gun:[95,156,8,2], flag:[176,53], windows:[[169,114],[224,154],[192,153],[256,177]]
  },
  walker: {
    name:'沼澤四足堡', colors:['#77855d','#414f41','#d2e79c'], drive:'legs',
    hull:'M61 204l34-51h161l40 52-27 27H83z', tower:'M124 150v-36l41-41 53 15 36 41v28z',
    trim:'M84 191h188m-116-74 38-23 35 24', gun:[93,161,10,2], flag:[173,74], windows:[[181,124],[104,183],[147,180],[246,192]]
  },
  citadel: {
    name:'古城雙塔堡', colors:['#9a8a9f','#5d526c','#f7ce94'], drive:'giant',
    hull:'M54 232l12-70 46-20h157l39 38v59H63z', tower:'M84 157V68h18v16h15V67h18v17h16V66h18v81h33V55h16v14h17V52h17v17h17V55h17v107z',
    trim:'M86 113h81m36-11h81m-197 85h194m-202 31h212', gun:[99,144,10,2], flag:[243,54], windows:[[126,105],[245,92],[181,183],[230,187]]
  },
  forge: {
    name:'熔爐巨獸', colors:['#a05853','#554350','#ffb272'], drive:'tracks',
    hull:'M42 224l25-62 55-31h123l37 30 35 66-25 20H67z', tower:'M120 144l-10-43 33-33h79l39 37-9 48zM234 91l-1-51 28-12 16 10-21 62z',
    trim:'M66 206l46-31h134l52 34m-161-62 14-51h63l22 49', gun:[90,160,12,3], flag:[168,66], windows:[[165,111],[203,111],[150,186],[181,186],[213,186]]
  },
  titan: {
    name:'霓光泰坦', colors:['#777aa9','#454564','#93f4ef'], drive:'legs',
    hull:'M41 207l38-59 46-24h116l50 43 32 44-28 27H65z', tower:'M91 148V87l21-28h41l34-30 37 32h42l25 39v71z',
    trim:'M73 195l45-34h134l43 33m-191-85 24-23h32l27-24 29 24h39l19 26m-138 99h108', gun:[92,127,12,3], flag:[187,29], windows:[[139,112],[187,97],[236,115],[124,188],[253,188]]
  }
};

function drawDrive(type, accent) {
  const wheels = (centers,y,r) => centers.map(x=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#303b4b"/><g class="wheel" style="transform-origin:${x}px ${y}px"><circle cx="${x}" cy="${y}" r="${r*.65}" fill="#637284"/><path d="M${x-r*.55} ${y}h${r*1.1}m-${r*.55} -${r*.55}v${r*1.1}" stroke="${accent}" stroke-width="3"/></g>`).join('');
  switch (type) {
    case 'tracks': return '<rect x="48" y="220" width="263" height="63" rx="30" fill="#293647"/>'+wheels([81,130,180,230,278],252,21);
    case 'giant': return wheels([102,247],248,38);
    case 'sled': return '<path fill="#49647a" d="m81 225 17 26h165l17-26 16 11-13 35H84l-21-34z"/><path d="M88 261h186" stroke="#cff9ff"/>';
    case 'float': return '<ellipse cx="183" cy="259" rx="110" ry="11" fill="#8ee8ec" opacity=".65"/><path fill="#395976" d="M105 229h155l-14 23H118z"/><path d="M135 253v10m42-11v15m49-15v11" stroke="#cbffff"/>';
    case 'legs': return '<path fill="#647180" d="m85 211-34 36-11 30h43l18-28 31-27m-17 4 12 48h28l-2-45m65-5 11 50h31l-4-42m-1-12 29 29 13 28h38l-13-41-35-37"/><circle cx="86" cy="242" r="9" fill="'+accent+'"/><circle cx="291" cy="243" r="10" fill="'+accent+'"/>';
    default: return wheels([98,151,206,257],253,24);
  }
}

export function enemyName(key) { return models[key].name; }

export function drawEnemy(key, weapons) {
  const model = models[key];
  const [bright,dark,accent] = model.colors;
  const [x,y,r,count] = model.gun;
  const [flagX,flagY] = model.flag;
  return `<svg data-model="${key}" viewBox="0 0 360 310" aria-hidden="true">
    <defs><linearGradient id="enemy-plate" x2="0%" y2="100%"><stop stop-color="${bright}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
    <ellipse cx="180" cy="286" rx="146" ry="13" fill="#22283c" opacity=".28"/>
    <g stroke="#273044" stroke-width="5" stroke-linejoin="round">
      ${drawDrive(model.drive,accent)}
      <path d="${model.hull}" fill="url(#enemy-plate)"/><path d="${model.tower}" fill="url(#enemy-plate)"/>
      <path d="${model.trim}" fill="none" stroke="${accent}" stroke-width="4" opacity=".85"/>
      <path d="M${flagX} ${flagY+7}v-30l38 8-38 10" fill="${accent}" stroke-width="3"/>
      ${model.windows.map(([wx,wy],i)=>`<g><rect x="${wx-10}" y="${wy-9}" width="20" height="18" rx="5" fill="#30364b" stroke-width="3"/><circle cx="${wx}" cy="${wy}" r="${i===0 ? 5 : 3}" fill="${accent}" stroke="none"/></g>`).join('')}
      ${Array.from({length:count},(_,i)=>`<g><path d="M${x+16} ${y+i*22}H${x-54-i*9}v${2*r}h${70+i*9}z" fill="#4b5269"/><rect x="${x-56-i*9}" y="${y+i*22-2}" width="14" height="${r*2+4}" rx="3" fill="${accent}" stroke-width="3"/></g>`).join('')}
    </g>
  </svg><div class="enemy-crew" aria-hidden="true">${weapons.slice(0,3).map(weapon=>`<span>${WEAPONS[weapon].icon}</span>`).join('')}</div>`;
}
