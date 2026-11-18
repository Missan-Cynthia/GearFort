import { KEYS, WEAPONS } from './config.js';

export function drawLandscape() {
  return `<svg viewBox="0 0 1200 490" preserveAspectRatio="none" width="100%" height="100%">
  <defs>
    <linearGradient id="sky" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#74c9dc"/><stop offset="1" stop-color="#f9e6a6"/></linearGradient>
    <linearGradient id="grass" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#9aa953"/><stop offset="1" stop-color="#597544"/></linearGradient>
    <pattern id="grassbits" width="113" height="41" patternUnits="userSpaceOnUse"><path d="M8 22l9-4m36 13h13m23-17l7-3" stroke="#dae987" stroke-width="3" opacity=".4" stroke-linecap="round"/></pattern>
  </defs>
  <path fill="url(#sky)" d="M0 0h1200v490H0z"/>
  <circle cx="876" cy="98" r="64" fill="#fff4b9"/>
  <g fill="#edfaf1" opacity=".78">
    <path d="M60 106q9-28 36-23 11-34 42-28 25 1 39 26 33-8 49 26z"/>
    <path d="M939 160q8-28 39-24 15-28 44-17 13 5 21 19 27-7 39 22z"/>
    <path d="M414 78q10-25 34-21 12-24 43-14 17 4 24 20 24-4 34 15z"/>
  </g>
  <path fill="#709bad" d="M0 285 105 177l48 51 47-65 102 106 101-51 45 40 119-103 97 99 89-46 64 51 119-103 94 81 73-61 97 78v151H0z"/>
  <path fill="#c7e0cf" opacity=".67" d="m63 222 42-45 48 51-42-17-16 14zm439-10 65-57 61 62-57-26-20 15zm369 0 65-56 57 48-46-13-26 19z"/>
  <path fill="#688e75" d="M0 316q97-56 218-29 125 31 222-4 126-46 287 8 109 33 214-9 128-46 259 8v170H0z"/>
  <path fill="url(#grass)" d="M0 378q129-82 303-37t316-7q148-64 320 2 144 48 261-12v166H0z"/>
  <path fill="url(#grassbits)" d="M0 405q230-63 409-29t360-7q195-34 431 8v113H0z"/>
  <path d="M0 437q284-18 605-4t595-6v63H0z" fill="#9d7956"/>
  <path d="M0 437q284-18 605-4t595-6" fill="none" stroke="#d8b679" stroke-width="8"/>
  </svg>`;
}

export function drawCastle(side) {
  const player = side === 0;
  const palette = player ? ['#6ed3ff','#2f78ad','#a9e5ff'] : ['#ff9c82','#a9484b','#ffd2a0'];
  const [bright,dark,light] = palette;
  const pins = [[39,71],[66,72],[32,38],[55,14],[66,39],[28,84],[77,84]];
  const crew = ['👨🏻‍✈️','👩🏽‍✈️','👨🏾‍🚀','👩🏻‍✈️','👩🏽‍🔧','👨🏻‍🔧','👩🏻‍🔧'];
  return `<svg viewBox="0 0 360 310" aria-hidden="true">
    <defs><linearGradient id="plate${side}" x2="0" y2="100%"><stop stop-color="${bright}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
    <g transform="${player ? '' : 'translate(360 0) scale(-1 1)'}" stroke="#253448" stroke-width="5" stroke-linejoin="round">
      <ellipse cx="181" cy="288" rx="149" ry="14" fill="#293744" opacity=".25" stroke="none"/>
      <g class="steam" stroke="none" fill="#fff6d7"><circle cx="76" cy="29" r="13"/><circle cx="57" cy="16" r="10"/><circle cx="44" cy="7" r="7"/></g>
      <path fill="#576579" d="M77 129 70 49h31l-3 80z"/><path fill="#f8c772" d="M64 44h42v14H64z"/>
      <path fill="#7a8593" d="m69 187-30 53 18 31h30l-10-29 39-45m161-11 38 51-11 33h-31l5-27-48-39"/>
      <path fill="#405064" d="M79 216h205l18 49-27 18H83l-28-22z"/>
      ${[100,155,210,265].map(x=>`<g><circle cx="${x}" cy="259" r="26" fill="#2d3b4e"/><g class="wheel" style="transform-origin:${x}px 259px"><circle cx="${x}" cy="259" r="18" fill="#778493"/><path d="M${x-15} 259h30m-15-15v30" stroke="#a8b2ad"/><circle cx="${x}" cy="259" r="6" fill="#f6ba62" stroke-width="2"/></g></g>`).join('')}
      <path fill="url(#plate${side})" d="m61 135 103-19 109 12 23 41-9 72H66l-17-38z"/>
      <path fill="url(#plate${side})" d="M104 77h128l18 54-17 40H93l-9-37z"/>
      <path fill="url(#plate${side})" d="M138 46h63l18 31h-98z"/>
      <path fill="#f6bd65" d="M161 47V12l42 7-42 14"/>
      <path fill="#283948" d="M106 96h44v34h-44zm76 0h44v34h-44zM95 184h55v34H95zm75 0h54v34h-54z"/>
      <path stroke="${light}" fill="none" stroke-width="4" d="M63 166h216M81 229h194M104 83h128"/>
      <path fill="#546477" d="m247 163 45-12 45 4v23l-45 4-45-2z"/>
      <path fill="#f0b96b" d="M322 150h19v32h-19z"/>
      <path fill="#546477" d="m239 194 48-4 32 9v13l-79 1z"/>
      <path fill="#7a5685" d="M233 112l39-34 16 17-36 39z"/>
      <path fill="#b6ecf1" d="m269 82 11-18 16 16-13 17z"/>
      <path fill="#f0b96b" d="M76 196h13v18H76zm180 30h18v8h-18z"/>
      <circle cx="71" cy="155" r="4" fill="${light}" stroke="none"/><circle cx="265" cy="153" r="4" fill="${light}" stroke="none"/>
    </g>
  </svg><div class="crew">${KEYS.map((key,i)=>{
    const [x,y] = pins[i];
    const pos = `style="left:${player ? x : 100-x}%;top:${y}%"`;
    return player
      ? `<button data-crew="${key}" ${pos} aria-label="${WEAPONS[key].crew}，${WEAPONS[key].name}" title="${WEAPONS[key].crew}｜${WEAPONS[key].name}">${crew[i]}</button>`
      : `<span ${pos} aria-hidden="true">${crew[i]}</span>`;
  }).join('')}</div>`;
}
