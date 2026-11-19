const backgrounds = {
  meadow: {
    sky:['#75cade','#ffefb0'], far:'#76a69e', near:'#88ab60', road:'#a17e58',
    horizon:'M0 333Q120 220 273 306T592 306T906 288T1200 306V454H0Z',
    landmarks:'<path fill="#588b68" d="M0 363q134-74 259-26t235-7q190-113 349 9 161-82 357-15v113H0z"/><path fill="#e4efad" d="M93 400l13-16 4 16 10-9 4 9zm852 17 15-22 3 18 14-9 6 13z"/><g fill="#fff4bc"><circle cx="203" cy="391" r="6"/><circle cx="244" cy="401" r="7"/><circle cx="994" cy="397" r="5"/></g>'
  },
  desert: {
    sky:['#e99963','#ffe1a0'], far:'#da945a', near:'#c7874d', road:'#9c593a',
    horizon:'M0 350Q189 194 356 312Q484 365 656 275T1200 310V454H0Z',
    landmarks:'<path fill="#efba6d" d="M0 378q242-158 491-27t709 0v88H0z"/><g fill="none" stroke="#667649" stroke-width="16" stroke-linecap="round"><path d="M165 410v-65m0 39q-34 4-33-31m33 20q32 4 31-24M1040 414v-83m0 56q34 2 35-38m-35 18q-23 3-24-27"/></g><path stroke="#ad7045" stroke-width="5" fill="none" d="M328 399q47-19 108-10m278 4q54-24 97-18"/>'
  },
  forest: {
    sky:['#366d69','#b6d992'], far:'#519879', near:'#477653', road:'#5f543e',
    horizon:'M0 307 110 240l86 79 101-109 159 111 124-84 149 85 107-115 165 96 88-78 111 82v147H0Z',
    landmarks:'<g fill="#255747"><path d="M0 352 66 183l64 169H88v62H46v-62zm127 15 58-147 60 147h-42v45h-33v-45zm166-29 65-167 67 167h-47v66h-39v-66zm540 9 57-169 72 169h-48v61h-40v-61zm141 9 66-154 69 154h-45v57h-41v-57zm116-17 62-152 48 129v100h-65v-77z"/></g><g fill="#b8e584"><circle cx="251" cy="311" r="5"/><circle cx="755" cy="298" r="6"/><circle cx="806" cy="344" r="4"/><circle cx="497" cy="345" r="5"/></g>'
  },
  snow: {
    sky:['#577cae','#d7f2fb'], far:'#829cbd', near:'#b4d7e6', road:'#7f9db1',
    horizon:'M0 311 133 181l111 93L410 105l182 202L755 154l91 91 105-132 249 192v149H0Z',
    landmarks:'<path fill="#f4fbff" d="m76 238 57-57 54 45-47-10-19 20zm254-52 80-81 82 91-63-26-22 28-27-26zm362 31 63-63 55 56-47-14-25 16zm187-10 72-94 99 77-80-16-25 25-28-19z"/><path fill="#e7f6fd" d="M0 385q124-47 258-17t297-7q133-49 304 8t341-8v71H0z"/><path fill="#82c7e8" d="m141 404 23-47 16 47zm766 2 27-54 27 54zm48 2 16-30 15 30z"/>'
  },
  canyon: {
    sky:['#947aa9','#ffd1a3'], far:'#a66560', near:'#ab664b', road:'#744940',
    horizon:'M0 220h165l22 51h125l32 72h190l37-56h143l31-60h134l56-77h160l25 102h80v202H0Z',
    landmarks:'<path fill="#cc8d66" d="M0 269h131l38 55h151l68 68H0zm1200 15h-108l-36-44h-103l-53 100H790l-43 68h453z"/><path stroke="#e9ad78" stroke-width="8" fill="none" d="M0 301h142m-20 48h223m541 11h282m-191-68h223"/><path fill="#794940" d="M289 409l35-29 46 5 19 24zm580-2 27-31 38 4 31 27z"/>'
  },
  coast: {
    sky:['#548bc5','#b3ece7'], far:'#4085a9', near:'#78b7b7', road:'#ac8f69',
    horizon:'M0 317q158-86 348-3 103 52 247 12 248-87 605 9v119H0Z',
    landmarks:'<path fill="#3e95b0" d="M0 344q234 23 445 0t755 8v70H0z"/><path stroke="#c1f5ee" stroke-width="5" fill="none" d="M29 370q91-11 185 0m80 15q102-13 185 0m119-25q152-12 265 0m45 29q144-17 261 0"/><path fill="#e8ddc4" d="M953 348l8-131h35l12 131z"/><path fill="#b85c55" d="M958 254h41l4 29h-47zm-5-41 25-23 27 23v14h-52z"/><rect x="965" y="217" width="27" height="10" fill="#ffe181"/>'
  },
  marsh: {
    sky:['#4b596c','#bcdab0'], far:'#697e75', near:'#617855', road:'#5e684a',
    horizon:'M0 307q140-40 269 10 111-88 277 3 135-47 229 9 193-75 425-11v136H0Z',
    landmarks:'<g fill="#344e46"><path d="M100 407l17-112-45-41 13-10 43 31 13-73 17 4-3 78 59-43 9 17-63 46 4 103zm855 0 4-99-50-38 10-13 42 30 8-89 16 5 2 77 53-32 6 15-56 47 8 97z"/></g><g fill="#86b59a" opacity=".6"><ellipse cx="310" cy="391" rx="142" ry="10"/><ellipse cx="777" cy="403" rx="210" ry="11"/></g><path fill="none" stroke="#aac077" stroke-width="5" d="m282 409-13-33m13 33 5-39m525 26 8-36m-8 36-13-27"/>'
  },
  ruins: {
    sky:['#655888','#f3b985'], far:'#897288', near:'#958367', road:'#74665c',
    horizon:'M0 308h120v-42h77v56h117v-56h73v-72h41v113h85v-36h68v47h148v-53h66v-42h66v87h110v-44h58v-60h47v99h124v149H0Z',
    landmarks:'<path fill="#645766" d="M106 408v-97h67v-49h47v61h56v85h-38v-51q-18-31-34 0v51zm761 0V280h30v-49h32v49h44v128h-34v-65q-19-33-38 0v65z"/><path fill="#c0a381" d="m404 410 38-36 61 36zm291-2 0-42 45-12 39 54z"/><path fill="none" stroke="#ad977f" stroke-width="6" d="M111 329h77m26-25h55m607 7h88m-84 42h11"/>'
  },
  volcano: {
    sky:['#3a3452','#e48163'], far:'#6f4956', near:'#624955', road:'#4f3c48',
    horizon:'M0 346 175 240l69 37 153-83 82 45L572 92h90l99 143 111-32 128 83 74-55 126 74v149H0Z',
    landmarks:'<path fill="#ef7754" d="m572 92 26 88-39 43-9 66 20-57 60-50 12-49 20-41z"/><path fill="#ffb067" d="M583 110h68l-13 29-35 8z"/><g fill="#3c3448" opacity=".75"><ellipse cx="613" cy="68" rx="54" ry="21"/><ellipse cx="635" cy="38" rx="76" ry="28"/></g><path fill="none" stroke="#ff894f" stroke-width="7" d="m219 402 63-24 84 13 27-20m420 28 55-29 77 8 41-19"/>'
  },
  city: {
    sky:['#272951','#6573ac'], far:'#414575', near:'#504e78', road:'#31344e',
    horizon:'M0 316h56V202h70v46h53v-96h70v125h52v-83h89v112h94v-95h70v-76h69v136h71V160h88v151h59v-83h73v-88h72v164h69v-93h74v84h71v159H0Z',
    landmarks:'<path fill="#292b50" d="M80 408V269h96v139zm145 0V229h63v-22h37v201zm538 0V265h88v143zm146 0V205h108v203zm143 0V283h72v125z"/><path stroke="#71e2ed" stroke-width="6" d="M96 291h63m-63 21h63m87-52h58m-58 25h58m478 3h50m-50 25h50m103-79h59m-59 30h59m79 42h38"/><path stroke="#e281d2" stroke-width="5" d="M0 366h224m101 0h437m89 0h57m109 0h35m72 0h76"/><path fill="none" stroke="#91bbeb" stroke-width="3" d="M964 205v-66m-17 40h34"/>'
  }
};

export function drawLandscape(key) {
  const { sky, far, near, road, horizon, landmarks } = backgrounds[key];
  const night = key === 'city' || key === 'volcano';
  return `<svg data-background="${key}" viewBox="0 0 1200 490" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">
    <defs><linearGradient id="sky" x2="0%" y2="100%"><stop stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
    <path fill="url(#sky)" d="M0 0h1200v490H0z"/>
    <circle cx="890" cy="97" r="${night ? 41 : 59}" fill="${night ? '#e4ddfa' : '#fff0bb'}" opacity=".82"/>
    <g fill="#fffaea" opacity="${night ? '.26' : '.66'}"><path d="M58 108q9-28 36-23 11-34 42-28 25 1 39 26 33-8 49 26zM455 86q15-22 41-19 13-25 44-18 16 6 21 17 37 0 51 20zM939 145q8-23 39-21 15-27 44-17 13 5 21 17 27-7 39 21z"/></g>
    <path fill="${far}" d="${horizon}"/>
    <path fill="${near}" d="M0 357q192-26 398 9t386-5q174-44 416-6v115H0z"/>
    ${landmarks}
    <path fill="${road}" d="M0 436q284-18 605-4t595-6v64H0z"/><path d="M0 436q284-18 605-4t595-6" fill="none" stroke="#fff4d0" stroke-opacity=".45" stroke-width="7"/>
  </svg>`;
}
