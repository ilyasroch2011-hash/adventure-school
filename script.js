const SAVE_KEY = 'adventureSchoolSave_v2';

const AVATARS = ['🧑‍🚀','🦸','🧙','🥷','🧝','🐉','🦄','🧑‍🎤'];
const COLORS = ['#FF6F59','#5EC6E8','#57C46B','#FFC93C','#5B3A8E','#FF9FCF','#2E9E4A','#26324A'];

const SUBJECTS = {
  math:     { key:'math',     name:'Château des Maths',   icon:'🏰', desc:"Résous des défis numériques pour gagner de l'XP !", color:'var(--coral)' },
  francais: { key:'francais', name:'Village du Français', icon:'📚', desc:"Vocabulaire, conjugaison et orthographe t'attendent !", color:'var(--plum)' },
  anglais:  { key:'anglais',  name:"Royaume de l'Anglais",icon:'🇬🇧', desc:"Apprends de nouveaux mots en anglais !", color:'#3B6FD6' },
  sciences: { key:'sciences', name:'Labo des Sciences',   icon:'🔬', desc:"Découvre les secrets de la nature !", color:'#2E9E4A' },
  enigmes:  { key:'enigmes',  name:'Forêt des Énigmes',   icon:'🌲', desc:"Un mélange de défis pour les aventuriers !", color:'#7A5230' },
};

const ZONE_UNLOCK_LEVEL = { math:1, francais:2, anglais:3, sciences:4, enigmes:5 };

const SCHOOL_LEVELS = {
  cp:  { name:'CP',  age:'6-7 ans',   difficulty:1 },
  ce1: { name:'CE1', age:'7-8 ans',   difficulty:2 },
  ce2: { name:'CE2', age:'8-9 ans',   difficulty:3 },
  cm1: { name:'CM1', age:'9-10 ans',  difficulty:4 },
  cm2: { name:'CM2', age:'10-11 ans', difficulty:5 },
  '6e':{ name:'6e',  age:'11-12 ans', difficulty:6 },
  '5e':{ name:'5e',  age:'12-13 ans', difficulty:7 },
  '4e':{ name:'4e',  age:'13-14 ans', difficulty:8 },
  '3e':{ name:'3e',  age:'14-15 ans', difficulty:9 },
};

const BADGES = [
  { id:'first_quiz',  name:'Premier défi',       icon:'🏆', check:s=>s.stats.questionsAnswered>=1 },
  { id:'math_genius', name:'Génie des maths',    icon:'🧠', check:s=>(s.stats.bySubject.math.correct)>=20 },
  { id:'reader',      name:'Lecteur',            icon:'📚', check:s=>(s.stats.bySubject.francais.correct)>=20 },
  { id:'linguist',    name:'Linguiste',          icon:'🗣️', check:s=>(s.stats.bySubject.anglais.correct)>=20 },
  { id:'scientist',   name:'Petit scientifique', icon:'🔬', check:s=>(s.stats.bySubject.sciences.correct)>=20 },
  { id:'explorer',    name:'Explorateur',        icon:'🌍', check:s=>Object.keys(ZONE_UNLOCK_LEVEL).every(z=>s.zonesUnlocked[z]) },
  { id:'streak_master',name:'Maître de la série',icon:'🔥', check:s=>s.stats.bestStreak>=5 },
  { id:'daily_champ', name:'Champion du jour',   icon:'📅', check:s=>s.stats.dailyChallengesCompleted>=5 },
  { id:'treasure_hunter',name:'Chasseur de trésors',icon:'🏴‍☠️', check:s=>s.stats.treasuresFound>=16 },
  { id:'perfect_quiz',name:'Quiz parfait',       icon:'💯', check:s=>s.stats.perfectQuizzes>=3 },
];

const SHOP_ITEMS = [
  { id:'hat_wizard', name:'Chapeau Magicien', icon:'🎩', price:40,  cat:'hat' },
  { id:'hat_crown',  name:'Couronne',         icon:'👑', price:120, cat:'hat' },
  { id:'hat_cap',    name:'Casquette',        icon:'🧢', price:25,  cat:'hat' },
  { id:'shoes_boots',name:'Bottes',           icon:'👢', price:35,  cat:'shoes' },
  { id:'shoes_sneak',name:'Baskets',          icon:'👟', price:30,  cat:'shoes' },
  { id:'acc_glasses',name:'Lunettes',         icon:'🕶️', price:20,  cat:'accessory' },
  { id:'acc_wand',   name:'Baguette',         icon:'🪄', price:60,  cat:'accessory' },
  { id:'acc_shield', name:'Bouclier',         icon:'🛡️', price:70,  cat:'accessory' },
  { id:'deco_plant', name:'Plante',           icon:'🪴', price:20,  cat:'decoration' },
  { id:'deco_lamp',  name:'Lampe',            icon:'🏮', price:30,  cat:'decoration' },
  { id:'deco_carpet',name:'Tapis',            icon:'🧞', price:90,  cat:'decoration' },
  { id:'deco_trophy',name:'Trophée',          icon:'🏆', price:110, cat:'decoration' },
  { id:'pet_cat',    name:'Chat',             icon:'🐱', price:50,  cat:'pet' },
  { id:'pet_dog',    name:'Chien',            icon:'🐶', price:50,  cat:'pet' },
  { id:'pet_dragon', name:'Dragon',           icon:'🐲', price:200, cat:'pet' },
  { id:'pet_owl',    name:'Hibou',            icon:'🦉', price:80,  cat:'pet' },
];

const SoundManager = {
  ctx:null,
  init(){
    if(!this.ctx){
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e){}
    }
  },
  play(type){
    try {
      this.init();
      if(!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g); g.connect(this.ctx.destination);
      g.gain.value = 0.12;
      const t = this.ctx.currentTime;
      if(type==='correct'){
        o.type='sine';
        o.frequency.setValueAtTime(523,t);
        o.frequency.setValueAtTime(659,t+.1);
        o.frequency.setValueAtTime(784,t+.2);
        o.start(t); o.stop(t+.35);
      } else if(type==='wrong'){
        o.type='sawtooth';
        o.frequency.setValueAtTime(350,t);
        o.frequency.linearRampToValueAtTime(200,t+.3);
        o.start(t); o.stop(t+.3);
      } else if(type==='levelup'){
        o.type='square';
        o.frequency.setValueAtTime(440,t);
        o.frequency.setValueAtTime(554,t+.15);
        o.frequency.setValueAtTime(659,t+.3);
        o.frequency.setValueAtTime(880,t+.45);
        o.start(t); o.stop(t+.6);
      } else if(type==='treasure'){
        o.type='sine';
        o.frequency.setValueAtTime(523,t);
        o.frequency.setValueAtTime(659,t+.08);
        o.frequency.setValueAtTime(784,t+.16);
        o.frequency.setValueAtTime(1047,t+.24);
        o.start(t); o.stop(t+.35);
      }
    } catch(e){}
  }
};

const RIKO = {
  welcome:["Prêt pour un défi ? 💪","Une nouvelle aventure t'attend ! 🦊","On va apprendre en s'amusant ! 🎮"],
  correct:["Bien joué ! 🎉","Excellent ! 🌟","Tu as trouvé ! 👏","Bravo ! 🏆","Super réflexion ! 💡"],
  wrong:["Pas grave, on va comprendre ensemble 🤔","Tu étais proche ! 💪","Une erreur, c'est une occasion de comprendre ❤️"],
  explain:["Regardons ensemble comment trouver la réponse 💡","Suis-moi, on va décomposer le problème 🧩"],
  levelUp:["WAOUH ! Tu viens de passer un niveau ! 🎉","Niveau supérieur ! Tu progresses ! ⭐"],
  endGood:["Incroyable performance ! 🎉","Tu as assuré aujourd'hui ! 🏆"],
  endOk:["Très bien ! Continue comme ça ! 💪","Bien joué ! On progresse ! 🔥"],
  endWeak:["Ce n'est pas grave. On sait maintenant quoi travailler ❤️","On va s'entraîner sur ces points 💪"]
};
function msg(cat){
  const m = RIKO[cat] || ["Hmm 🤔"];
  return m[Math.floor(Math.random()*m.length)];
}

function defaultState(){
  return {
    created:false,
    name:'', gender:'neutre', avatarIndex:0, colorIndex:0,
    schoolLevel:null,
    parentPin:null,
    level:1, xp:0, coins:20,
    zonesUnlocked:{ math:true, francais:false, anglais:false, sciences:false, enigmes:false },
    badges:[],
    shopOwned:[],
    shopEquipped:{ hat:null, shoes:null, accessory:null },
    house:{ pet:null, decorations:[] },
    treasureFound:[],
    stats:{
      questionsAnswered:0, correctAnswers:0,
      bestStreak:0, perfectQuizzes:0, treasuresFound:0, dailyChallengesCompleted:0,
      bySubject:{
        math:{asked:0,correct:0}, francais:{asked:0,correct:0},
        anglais:{asked:0,correct:0}, sciences:{asked:0,correct:0}, enigmes:{asked:0,correct:0}
      },
      wrongQuestions:[],
      playSeconds:0
    },
    dailyChallenges:{
      date:null,
      progress:{ math:0, francais:0, anglais:0, sciences:0 },
      completed:false, rewardClaimed:false
    },
    firstPlayedAt:Date.now()
  };
}
let state = defaultState();

function save(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e){}
}

function load(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const p = JSON.parse(raw);
    state = Object.assign(defaultState(), p);
    state.zonesUnlocked = Object.assign(defaultState().zonesUnlocked, p.zonesUnlocked||{});
    state.stats = Object.assign(defaultState().stats, p.stats||{});
    state.stats.bySubject = Object.assign(defaultState().stats.bySubject, (p.stats&&p.stats.bySubject)||{});
    state.stats.wrongQuestions = p.stats?.wrongQuestions || [];
    state.shopEquipped = Object.assign(defaultState().shopEquipped, p.shopEquipped||{});
    state.house = Object.assign(defaultState().house, p.house||{});
    state.dailyChallenges = Object.assign(defaultState().dailyChallenges, p.dailyChallenges||{});
    state.treasureFound = Array.isArray(p.treasureFound) ? p.treasureFound : [];
    if(!state.schoolLevel || !SCHOOL_LEVELS[state.schoolLevel]) state.schoolLevel = null;
    return true;
  } catch(e){ return false; }
}

function xpNeeded(level){ return 100 + (level-1)*40; }

function $(id){ return document.getElementById(id); }

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  $(id).classList.remove('hidden');
  window.scrollTo(0,0);
}

function shuffle(a){
  const r = a.slice();
  for(let i=r.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [r[i],r[j]]=[r[j],r[i]];
  }
  return r;
}
function pickN(a,n){ return shuffle(a).slice(0, Math.min(n, a.length)); }

function toast(m){
  const t = $('toast');
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), 2200);
}

function setHUD(v){
  $('hud').classList.toggle('hidden', !v);
  $('hudXpBarWrap').classList.toggle('hidden', !v);
}

function refreshHUD(){
  const sn = state.schoolLevel && SCHOOL_LEVELS[state.schoolLevel] ? SCHOOL_LEVELS[state.schoolLevel].name : '?';
  $('hudSchoolLevel').textContent = sn;
  $('hudLevel').textContent = state.level;
  $('hudXp').textContent = state.xp;
  $('hudCoins').textContent = state.coins;
  const need = xpNeeded(state.level);
  $('hudXpBarFill').style.width = Math.min(100, (state.xp/need)*100) + '%';
}

function avatarSVG(color, emoji, size){
  size = size || 200;
  return `<circle cx="${size/2}" cy="${size/2}" r="${size/2-4}" fill="${color}22" stroke="${color}" stroke-width="6"></circle>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="${size*0.55}">${emoji}</text>`;
}
function curEmoji(){ return AVATARS[state.avatarIndex] || AVATARS[0]; }
function curColor(){ return COLORS[state.colorIndex] || COLORS[0]; }
function curHat(){
  const it = SHOP_ITEMS.find(i=>i.id===state.shopEquipped.hat);
  return it ? it.icon : '';
}

window.addEventListener('popstate', (e)=>{
  const ns = e.state;
  if(!ns || !ns.screenKey){ renderHome(); return; }
  const d = ns.data || {};
  switch(ns.screenKey){
    case 'home': renderHome(); break;
    case 'creator': renderCreator(); break;
    case 'map': state.created ? renderMap() : renderHome(); break;
    case 'subject-intro': (d.subject && SUBJECTS[d.subject]) ? openSubjectIntro(d.subject) : renderMap(); break;
    case 'shop': openShop(); break;
    case 'badges': openBadges(); break;
    case 'daily': renderDaily(); break;
    case 'revision': openRevision(); break;
    case 'treasure': openTreasure(); break;
    case 'parent-gate': openParentGate(); break;
    case 'parent-dashboard': state.parentPin ? renderParentDashboard() : renderHome(); break;
    default: renderHome();
  }
});

function rikoSay(text, emoji, cls){
  const a = $('rikoAvatar'), s = $('rikoSpeech');
  if(a){
    a.textContent = emoji || '🦊';
    a.className = 'riko-avatar ' + (cls||'idle');
    void a.offsetWidth;
    a.classList.add(cls||'idle');
  }
  if(s && text) s.textContent = text;
}
function rikoCorrect(){ rikoSay(msg('correct'),'🦊','happy'); SoundManager.play('correct'); }
function rikoWrong(){ rikoSay(msg('wrong'),'🦊','sad'); SoundManager.play('wrong'); }

function readPin(containerId){
  const ins = document.querySelectorAll(`#${containerId} .pin-input`);
  let p = '';
  ins.forEach(i=>{ p += i.value; });
  return p;
}

function bindPin(containerId, onChange){
  const c = document.getElementById(containerId);
  const ins = c.querySelectorAll('.pin-input');
  ins.forEach((inp, idx)=>{
    inp.addEventListener('input', function(){
      this.value = this.value.replace(/\D/g,'');
      if(this.value.length===1 && idx<ins.length-1) ins[idx+1].focus();
      if(onChange) onChange(readPin(containerId));
    });
    inp.addEventListener('keydown', function(e){
      if(e.key==='Backspace' && this.value==='' && idx>0) ins[idx-1].focus();
      if(e.key==='Enter' && onChange) onChange(readPin(containerId));
    });
    inp.addEventListener('paste', function(e){
      e.preventDefault();
      const txt = (e.clipboardData||window.clipboardData).getData('text');
      const digits = txt.replace(/\D/g,'').slice(0,4);
      if(digits){
        const chars = digits.split('');
        ins.forEach((x,i)=>{ if(i<chars.length) x.value = chars[i]; });
        if(chars.length<ins.length) ins[chars.length].focus();
        else ins[ins.length-1].focus();
        if(onChange) onChange(readPin(containerId));
      }
    });
  });
}

function clearPin(containerId){
  const ins = document.querySelectorAll(`#${containerId} .pin-input`);
  ins.forEach(i=>{ i.value=''; });
  if(ins.length) ins[0].focus();
}

let pendingPin = '';

function startParentOnboarding(){ showScreen('screen-parent-welcome'); }

$('btnParentWelcomeContinue').addEventListener('click', ()=>{
  showScreen('screen-parent-create-pin');
  clearPin('pinCreateContainer');
  $('pinCreateError').textContent = '';
  $('btnParentCreatePin').disabled = true;
  bindPin('pinCreateContainer', (p)=>{ $('btnParentCreatePin').disabled = p.length!==4; });
});

$('btnParentCreatePin').addEventListener('click', ()=>{
  const p = readPin('pinCreateContainer');
  if(p.length!==4) return;
  pendingPin = p;
  showScreen('screen-parent-confirm-pin');
  clearPin('pinConfirmContainer');
  $('pinConfirmError').textContent = '';
  $('btnParentConfirmPin').disabled = true;
  bindPin('pinConfirmContainer', (p)=>{ $('btnParentConfirmPin').disabled = p.length!==4; });
});

$('btnParentConfirmPin').addEventListener('click', ()=>{
  const p = readPin('pinConfirmContainer');
  if(p===pendingPin){
    state.parentPin = pendingPin;
    save();
    pendingPin = '';
    goToGame();
  } else {
    $('pinConfirmError').textContent = '❌ Les codes ne correspondent pas.';
    clearPin('pinConfirmContainer');
    $('btnParentConfirmPin').disabled = true;
  }
});

function openParentGate(){
  showScreen('screen-parent-gate');
  clearPin('pinGateContainer');
  $('pinGateError').textContent = '';
  $('btnParentGateUnlock').disabled = true;
  bindPin('pinGateContainer', (p)=>{ $('btnParentGateUnlock').disabled = p.length!==4; });
}

$('btnParentGateUnlock').addEventListener('click', ()=>{
  const p = readPin('pinGateContainer');
  if(p===state.parentPin) renderParentDashboard();
  else {
    $('pinGateError').textContent = '❌ Code incorrect.';
    clearPin('pinGateContainer');
    $('btnParentGateUnlock').disabled = true;
  }
});
$('btnParentGateBack').addEventListener('click', ()=>{
  state.created ? renderMap() : renderHome();
});

function goToGame(){ renderHome(); }

function renderHome(){
  setHUD(false);
  $('homeAvatar').innerHTML = avatarSVG(curColor(), curEmoji(), 200);
  const row = $('homeStatsRow');
  if(state.created){
    const sn = state.schoolLevel && SCHOOL_LEVELS[state.schoolLevel] ? SCHOOL_LEVELS[state.schoolLevel].name : '?';
    row.innerHTML = `
      <div class="hud-pill"><span class="ico">🏫</span>${sn}</div>
      <div class="hud-pill"><span class="ico">⭐</span>Niv.${state.level}</div>
      <div class="hud-pill"><span class="ico">⚡</span>${state.xp}</div>
      <div class="hud-pill"><span class="ico">🪙</span>${state.coins}</div>`;
    $('btnContinue').classList.remove('hidden');
    $('btnContinue').textContent = `🔄 Continuer, ${state.name} !`;
    $('btnPlay').textContent = '▶️ Nouvelle partie';
  } else {
    row.innerHTML = '';
    $('btnContinue').classList.add('hidden');
    $('btnPlay').textContent = '▶️ Jouer';
  }
  showScreen('screen-home');
}

let freshStart = false;

$('btnPlay').addEventListener('click', ()=>{
  if(state.created){
    if(!confirm('Nouvelle partie ? La progression actuelle sera effacée.')) return;
    freshStart = true;
  } else freshStart = true;
  renderCreator();
});

$('btnContinue').addEventListener('click', ()=>{
  if(!state.schoolLevel){ toast("Choisis d'abord ta classe 🏫"); renderCreator(); return; }
  renderMap();
});

$('btnParents').addEventListener('click', ()=>{
  state.parentPin ? openParentGate() : toast('Aucun code parent configuré.');
});

let draft = { name:'', gender:'neutre', avatarIndex:0, colorIndex:0, schoolLevel:null };

function renderCreator(){
  draft = {
    name: state.name || '',
    gender: state.gender || 'neutre',
    avatarIndex: state.avatarIndex || 0,
    colorIndex: state.colorIndex || 0,
    schoolLevel: state.schoolLevel || null
  };
  $('inputName').value = draft.name;

  const sel = $('schoolLevelSelect');
  sel.innerHTML = '<option value="">-- Choisis ta classe --</option>';
  Object.entries(SCHOOL_LEVELS).forEach(([k,v])=>{
    const o = document.createElement('option');
    o.value = k;
    o.textContent = `${v.name} (${v.age})`;
    if(draft.schoolLevel===k) o.selected = true;
    sel.appendChild(o);
  });
  sel.onchange = (e)=>{ draft.schoolLevel = e.target.value || null; };

  const gr = $('genderRow');
  gr.innerHTML = '';
  [['garcon','Garçon'],['fille','Fille'],['neutre','Neutre']].forEach(([v,l])=>{
    const b = document.createElement('button');
    b.className = 'option-chip' + (draft.gender===v?' selected':'');
    b.textContent = l;
    b.onclick = ()=>{
      draft.gender = v;
      gr.querySelectorAll('.option-chip').forEach(c=>c.classList.remove('selected'));
      b.classList.add('selected');
    };
    gr.appendChild(b);
  });

  const ag = $('avatarGrid');
  ag.innerHTML = '';
  AVATARS.forEach((em, i)=>{
    const b = document.createElement('button');
    b.className = 'avatar-choice' + (draft.avatarIndex===i?' selected':'');
    b.textContent = em;
    b.onclick = ()=>{
      draft.avatarIndex = i;
      ag.querySelectorAll('.avatar-choice').forEach(c=>c.classList.remove('selected'));
      b.classList.add('selected');
    };
    ag.appendChild(b);
  });

  const cg = $('colorGrid');
  cg.innerHTML = '';
  COLORS.forEach((hex, i)=>{
    const b = document.createElement('button');
    b.className = 'color-choice' + (draft.colorIndex===i?' selected':'');
    b.style.background = hex;
    b.onclick = ()=>{
      draft.colorIndex = i;
      cg.querySelectorAll('.color-choice').forEach(c=>c.classList.remove('selected'));
      b.classList.add('selected');
    };
    cg.appendChild(b);
  });

  setHUD(false);
  showScreen('screen-creator');
}

$('btnCreateConfirm').addEventListener('click', ()=>{
  const n = $('inputName').value.trim();
  if(!n){ toast('Choisis un prénom ✏️'); return; }
  if(!draft.schoolLevel){ toast('Choisis ta classe 🏫'); return; }

  const isNew = !state.created || freshStart;
  if(isNew){
    const f = defaultState();
    Object.assign(f, {
      created:true, name:n, gender:draft.gender,
      avatarIndex:draft.avatarIndex, colorIndex:draft.colorIndex,
      schoolLevel:draft.schoolLevel, parentPin:state.parentPin
    });
    state = f;
  } else {
    state.name = n;
    state.gender = draft.gender;
    state.avatarIndex = draft.avatarIndex;
    state.colorIndex = draft.colorIndex;
    state.schoolLevel = draft.schoolLevel;
  }
  state.created = true;
  freshStart = false;
  save();
  toast(`Bienvenue, ${n} ! 🎉`);
  renderMap();
});

function renderMap(){
  refreshHUD();
  setHUD(true);
  $('hudBackBtn').classList.add('hidden');
  const sn = state.schoolLevel && SCHOOL_LEVELS[state.schoolLevel] ? SCHOOL_LEVELS[state.schoolLevel].name : '?';
  $('mapGreeting').textContent = `Salut ${state.name} (${sn}) !`;

  const grid = $('zoneGrid');
  grid.innerHTML = '';

  Object.values(SUBJECTS).forEach(sub=>{
    const unlocked = !!state.zonesUnlocked[sub.key];
    const lvl = ZONE_UNLOCK_LEVEL[sub.key];
    const card = document.createElement('button');
    card.className = 'zone-card' + (unlocked ? '' : ' locked');
    const st = state.stats.bySubject[sub.key];
    const pct = st.asked>0 ? Math.min(100, Math.round((st.correct/Math.max(20,st.asked))*100)) : 0;
    card.innerHTML = `
      ${unlocked ? '' : '<div class="zone-lock">🔒</div>'}
      <div class="zone-icon">${sub.icon}</div>
      <div class="zone-name">${sub.name}</div>
      ${unlocked
        ? `<div class="zone-progress"><div class="zone-progress-fill" style="width:${pct}%;background:${sub.color};"></div></div>
           <div class="zone-unlock-hint">${st.correct} bonnes réponses</div>`
        : `<div class="zone-unlock-hint">Niveau ${lvl} requis</div>`}`;
    card.onclick = ()=>{
      if(!unlocked){ toast(`🔒 Débloque cette zone au niveau ${lvl} !`); return; }
      if(!state.schoolLevel){ toast("Choisis ta classe ! 🏫"); renderCreator(); return; }
      openSubjectIntro(sub.key);
    };
    grid.appendChild(card);
  });

  [
    { icon:'🏠', name:'Maison du joueur', desc:'Personnalise ta maison', act:openShop },
    { icon:'🎖️', name:'Mes badges', desc:`${state.badges.length}/${BADGES.length} obtenus`, act:openBadges },
    { icon:'📚', name:'Zone de révision', desc:'Revois tes erreurs', act:openRevision },
    { icon:'🏴‍☠️', name:'Chasse au trésor', desc:'Trouve les trésors !', act:openTreasure },
  ].forEach(b=>{
    const c = document.createElement('button');
    c.className = 'zone-card full-width';
    c.innerHTML = `
      <div class="zone-icon">${b.icon}</div>
      <div style="display:flex;flex-direction:column;align-items:flex-start;">
        <div class="zone-name">${b.name}</div>
        <div class="zone-unlock-hint">${b.desc}</div>
      </div>`;
    c.onclick = b.act;
    grid.appendChild(c);
  });

  showScreen('screen-map');
}
$('hudBackBtn').addEventListener('click', renderMap);

function unlockZones(){
  const n = [];
  Object.entries(ZONE_UNLOCK_LEVEL).forEach(([k, l])=>{
    if(state.level>=l && !state.zonesUnlocked[k]){
      state.zonesUnlocked[k] = true;
      n.push(k);
    }
  });
  return n;
}

let curSubject = null;

function openSubjectIntro(key){
  curSubject = key;
  const s = SUBJECTS[key];
  $('subjectIcon').textContent = s.icon;
  $('subjectName').textContent = s.name;
  $('subjectDesc').textContent = s.desc;
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  showScreen('screen-subject-intro');
}
$('btnStartQuiz').addEventListener('click', ()=>{ startQuiz(curSubject); });

function rnd(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

function choices(correct, variants){
  const s = new Set([correct]);
  variants.forEach(v=>{ if(s.size<4 && !s.has(v)) s.add(v); });
  while(s.size<4){
    const f = typeof correct==='number' ? correct + rnd(-5,5) : `${correct}x`;
    if(!s.has(f) && f!==0) s.add(f);
  }
  return shuffle(Array.from(s));
}

function mathQuestion(level){
  let q, correct, ch, expl, steps = [], rule = '';

  switch(level){
    case 'cp': {
      const a = rnd(1,10), b = rnd(1,10);
      correct = a+b;
      q = `Combien font ${a} + ${b} ?`;
      ch = choices(correct,[correct-1,correct+1,correct+2]).map(String);
      expl = `La somme de ${a} et ${b} donne ${correct}.`;
      steps = [`On part de ${a}`, `On ajoute ${b}`, `Résultat : ${correct}`];
      rule = "L'addition sert à réunir deux ensembles.";
      break;
    }
    case 'ce1': {
      const a = rnd(2,9), b = rnd(2,9);
      correct = a*b;
      q = `Combien font ${a} × ${b} ?`;
      ch = choices(correct,[correct-a,correct+b,correct+2]).map(String);
      expl = `${a} répété ${b} fois donne ${correct}.`;
      steps = [`${a} × ${b}`, `Additionner ${a}, ${b} fois`, `Résultat : ${correct}`];
      rule = "La multiplication est une addition répétée.";
      break;
    }
    case 'ce2': {
      const b = rnd(2,10), ans = rnd(2,10), a = b*ans;
      correct = ans;
      q = `Combien font ${a} ÷ ${b} ?`;
      ch = choices(correct,[correct-1,correct+1,correct+2]).map(String);
      expl = `Combien de fois ${b} rentre dans ${a}.`;
      steps = [`Nombre : ${a}`, `Diviseur : ${b}`, `${b} × ${ans} = ${a} donc ${ans}`];
      rule = "La division c'est un partage.";
      break;
    }
    case 'cm1': {
      const num = rnd(1,5), den = rnd(6,12);
      q = `Quelle est la moitié de ${num*2}/${den} ?`;
      correct = `${num}/${den}`;
      ch = choices(correct,[`${num+1}/${den}`,`${num}/${den*2}`,`${num*2}/${den}`]);
      expl = `Diviser par 2 le numérateur.`;
      steps = [`${num*2}/${den}`, `(${num*2}÷2)/${den}`, `${num}/${den}`];
      rule = "Moitié d'une fraction = moitié du numérateur.";
      break;
    }
    case 'cm2': {
      const p = rnd(2,9)*10, total = rnd(1,5)*100;
      correct = (p*total)/100;
      q = `Combien font ${p}% de ${total} ?`;
      ch = choices(correct,[correct-10,correct+10,correct*2]).map(String);
      expl = `Multiplier par ${p} puis diviser par 100.`;
      steps = [`${total} × ${p} = ${total*p}`, `÷100`, `${correct}`];
      rule = "x% d'un nombre = (nombre × x) / 100";
      break;
    }
    case '6e': {
      const a = rnd(2,15);
      correct = `${a*a} cm²`;
      q = `Quel est l'aire d'un carré de côté ${a} cm ?`;
      ch = choices(correct,[`${a*4} cm²`,`${a*a-5} cm²`,`${a*a+10} cm²`]);
      expl = `Aire = côté × côté.`;
      steps = [`${a} × ${a}`, `${a*a} cm²`];
      rule = "Aire d'un carré = côté².";
      break;
    }
    case '5e': {
      const x = rnd(2,8), b = rnd(1,10), res = x+b;
      correct = String(x);
      q = `Résous : x + ${b} = ${res}`;
      ch = choices(correct,[String(x+1),String(x-1),String(res)]);
      expl = `Soustraire ${b} des deux côtés.`;
      steps = [`x + ${b} = ${res}`, `x = ${res} - ${b}`, `x = ${x}`];
      rule = "On fait la même opération des deux côtés.";
      break;
    }
    case '4e': {
      const trips = [[3,4,5],[6,8,10],[5,12,13],[9,12,15]];
      const t = trips[rnd(0,trips.length-1)];
      q = `Triangle rectangle, côtés ${t[0]} et ${t[1]} cm. Hypoténuse ?`;
      correct = `${t[2]} cm`;
      ch = choices(correct,[`${t[0]+t[1]} cm`,`${t[2]+2} cm`,`${t[2]-1} cm`]);
      expl = `Théorème de Pythagore.`;
      steps = [
        `${t[0]}² = ${t[0]*t[0]}`,
        `${t[1]}² = ${t[1]*t[1]}`,
        `${t[0]*t[0]} + ${t[1]*t[1]} = ${t[2]*t[2]}`,
        `√${t[2]*t[2]} = ${t[2]}`
      ];
      rule = "a² + b² = c² dans un triangle rectangle.";
      break;
    }
    case '3e': {
      const type = rnd(1,3);
      if(type===1){
        const a = rnd(2,5), b = rnd(1,9), x = rnd(1,5);
        const res = a*x+b;
        q = `f(x) = ${a}x + ${b}. Calcule f(${x}).`;
        correct = String(res);
        ch = choices(correct,[String(res+a),String(res-b),String(a+b+x)]);
        expl = `Remplacer x par ${x}.`;
        steps = [`f(${x}) = ${a} × ${x} + ${b}`, `${a*x} + ${b}`, `${res}`];
        rule = "Image = on remplace x par la valeur.";
      } else if(type===2){
        const a = rnd(2,6);
        q = `Développe (x + ${a})²`;
        correct = `x² + ${2*a}x + ${a*a}`;
        ch = choices(correct,[`x² + ${a*a}`,`x² + ${a}x + ${a*a}`,`2x + ${2*a}`]);
        expl = `(a+b)² = a² + 2ab + b².`;
        steps = [`a=x, b=${a}`, `x² + 2x×${a} + ${a}²`, `x² + ${2*a}x + ${a*a}`];
        rule = "Identité remarquable (a+b)² = a² + 2ab + b².";
      } else {
        const a = rnd(2,4), b = rnd(1,10), x = rnd(2,6);
        const target = a*x - b;
        q = `Résous : ${a}x - ${b} = ${target}`;
        correct = `x = ${x}`;
        ch = choices(correct,[`x = ${x+1}`,`x = ${x-1}`,`x = ${target}`]);
        expl = `Isoler x.`;
        steps = [
          `${a}x - ${b} = ${target}`,
          `${a}x = ${target+b}`,
          `x = ${target+b}/${a} = ${x}`
        ];
        rule = "Pour ax - b = c, on ajoute b puis on divise par a.";
      }
      break;
    }
    default: {
      const a = rnd(1,5), b = rnd(1,5);
      correct = a+b;
      q = `Combien font ${a} + ${b} ?`;
      ch = choices(correct,[correct-1,correct+1,correct+2]).map(String);
      expl = `${a} + ${b} = ${correct}`;
      steps = [`${a} + ${b}`, `${correct}`];
      rule = "Addition simple.";
    }
  }

  return {
    question:q,
    choices:ch,
    correctIndex: ch.indexOf(String(correct)),
    explain:expl, steps, rule
  };
}

const FR = [
  { q:"Première lettre de « chat » ?", choices:["c","h","a","t"], correctIndex:0, steps:["On regarde le mot", "Ça commence par 'c'"], rule:"L'alphabet commence par a, b, c..." },
  { q:"« Le chat dort. » Que fait le chat ?", choices:["Il mange","Il dort","Il court","Il joue"], correctIndex:1, steps:["Verbe = 'dort'", "Il dort"], rule:"Le verbe dit ce que fait le sujet." },
  { q:"Synonyme de « content » ?", choices:["Triste","Heureux","Fatigué","Fâché"], correctIndex:1, steps:["Content = joie", "Heureux = joie"], rule:"Synonymes = même sens." },
  { q:"Contraire de « chaud » ?", choices:["Tiède","Brûlant","Froid","Sec"], correctIndex:2, steps:["Opposé de chaud", "Froid"], rule:"Antonyme = sens contraire." },
  { q:"Pluriel de « cheval » ?", choices:["Chevals","Chevaux","Chevales","Chevaus"], correctIndex:1, steps:["Finit par -al", "-al devient -aux"], rule:"-al → -aux au pluriel (sauf exceptions)." },
  { q:"Féminin de « acteur » ?", choices:["Acteure","Actrice","Actriste","Actoresse"], correctIndex:1, steps:["-teur devient -trice", "Actrice"], rule:"Souvent -teur → -trice au féminin." }
];

const EN = [
  { q:"« Apple » means...", choices:["Pomme","Maison","Chien","Livre"], correctIndex:0, steps:["Apple = fruit", "Pomme"], rule:"Vocabulaire fruits." },
  { q:"« Dog » means...", choices:["Chat","Oiseau","Chien","Poisson"], correctIndex:2, steps:["Dog = animal", "Chien"], rule:"Animaux domestiques." },
  { q:"« Cat » means...", choices:["Chat","Chien","Souris","Lapin"], correctIndex:0, steps:["Cat = animal", "Chat"], rule:"Animaux domestiques." }
];

const SCI = [
  { q:"Quel animal vit dans l'eau ?", choices:["Le lapin","Le poisson","Le chat","Le chien"], correctIndex:1, steps:["Habitat aquatique", "Le poisson a des ouïes"], rule:"Les animaux aquatiques sont adaptés à l'eau." },
  { q:"Que donne la vache ?", choices:["Du lait","Des œufs","Du miel","De la laine"], correctIndex:0, steps:["Mammifère", "Produit du lait"], rule:"Les mammifères femelles donnent du lait." },
  { q:"Combien d'os chez l'adulte ?", choices:["206","106","306","406"], correctIndex:0, steps:["Anatomie", "206 os"], rule:"Le squelette soutient le corps." }
];

function bankSession(bank, n){
  return pickN(bank, n).map(it=>{
    const shuf = shuffle(it.choices);
    const right = it.choices[it.correctIndex];
    return {
      question:it.q,
      choices:shuf,
      correctIndex:shuf.indexOf(right),
      explain:`Bonne réponse : ${right}`,
      steps:it.steps || [it.q, right],
      rule:it.rule || ''
    };
  });
}

function buildSession(subject, level){
  const N = 8;
  if(!level || !SCHOOL_LEVELS[level]) level = 'cp';
  if(subject==='math') return Array.from({length:N}, ()=>mathQuestion(level));
  if(subject==='francais') return bankSession(FR, N);
  if(subject==='anglais') return bankSession(EN, N);
  if(subject==='sciences') return bankSession(SCI, N);
  if(subject==='enigmes'){
    return shuffle([
      ...Array.from({length:2}, ()=>mathQuestion(level)),
      ...bankSession(FR,2),
      ...bankSession(EN,2),
      ...bankSession(SCI,2)
    ]);
  }
  return bankSession(FR, N);
}

let quiz = null;

function startQuiz(subject){
  if(!state.schoolLevel){ toast("Choisis ta classe ! 🏫"); renderCreator(); return; }
  quiz = {
    subjectKey: subject,
    questions: buildSession(subject, state.schoolLevel),
    index:0, correctCount:0, streak:0,
    earnedXp:0, earnedCoins:0, answered:false
  };
  rikoSay(msg('welcome'),'🦊','idle');
  refreshHUD();
  renderQuizQ();
  showScreen('screen-quiz');
}

function renderQuizQ(){
  const s = quiz;
  if(!s || s.index >= s.questions.length) return;
  const q = s.questions[s.index];

  $('quizProgressLabel').textContent = `Question ${s.index+1}/${s.questions.length}`;
  $('quizStreakLabel').textContent = `🔥 x${s.streak}`;
  $('quizQuestion').textContent = q.question;
  $('quizFeedback').className = 'quiz-feedback';
  $('quizFeedback').textContent = '';
  $('quizExplanation').className = 'quiz-explanation';
  $('quizExplanation').textContent = '';
  $('quizNextWrap').classList.add('hidden');
  s.answered = false;
  $('btnQuizExplain').classList.add('hidden');
  $('btnQuizRetry').classList.add('hidden');
  $('quizActions').classList.add('hidden');

  const box = $('quizChoices');
  box.innerHTML = '';
  q.choices.forEach((c, i)=>{
    const b = document.createElement('button');
    b.className = 'choice-btn';
    b.textContent = c;
    b.onclick = ()=>pickChoice(i, b);
    box.appendChild(b);
  });
}

function pickChoice(idx, btn){
  const s = quiz;
  if(s.answered) return;
  s.answered = true;
  const q = s.questions[s.index];
  const ok = idx===q.correctIndex;
  const all = Array.from($('quizChoices').children);

  all.forEach((b,i)=>{
    if(i===q.correctIndex) b.classList.add('correct');
    else if(i===idx && !ok) b.classList.add('wrong');
    else b.classList.add('dim');
  });

  if(!q._counted){
    q._counted = true;
    state.stats.questionsAnswered++;
    state.stats.bySubject[s.subjectKey].asked++;
  }

  const fb = $('quizFeedback');
  fb.classList.add('show');

  if(ok){
    s.correctCount++; s.streak++;
    if(!q._cCounted){
      q._cCounted = true;
      state.stats.correctAnswers++;
      state.stats.bySubject[s.subjectKey].correct++;
    }
    if(s.streak > state.stats.bestStreak) state.stats.bestStreak = s.streak;
    const xp = 20 + Math.min(10, s.streak*2);
    const cn = 5;
    s.earnedXp += xp; s.earnedCoins += cn;
    state.xp += xp; state.coins += cn;
    fb.className = 'quiz-feedback show ok';
    fb.textContent = `✅ Bonne réponse ! (+${xp} XP)`;
    if(s.streak>=3) rikoSay(`🔥 ${s.streak} d'affilée !`,'🔥','happy');
    else rikoCorrect();
    maybeLevelUp();
    updateDaily(s.subjectKey);
    const wi = state.stats.wrongQuestions.findIndex(w=>w.question===q.question);
    if(wi>=0) state.stats.wrongQuestions.splice(wi,1);
  } else {
    s.streak = 0;
    fb.className = 'quiz-feedback show ko';
    fb.textContent = '❌ Pas tout à fait.';
    rikoWrong();
    if(!state.stats.wrongQuestions.some(w=>w.question===q.question)){
      state.stats.wrongQuestions.push({ question:q.question, correctAnswer:q.choices[q.correctIndex] });
      if(state.stats.wrongQuestions.length>50) state.stats.wrongQuestions.shift();
    }
    $('quizActions').classList.remove('hidden');
    $('btnQuizExplain').classList.remove('hidden');
    $('btnQuizExplain').onclick = ()=>showExplain(q);
    $('btnQuizRetry').classList.remove('hidden');
    $('btnQuizRetry').onclick = ()=>{
      s.answered = false;
      renderQuizQ();
      rikoSay("On réessaie ! 💪",'🦊','motivated');
    };
  }

  refreshHUD();
  save();
  $('quizNextWrap').classList.remove('hidden');
  $('quizStreakLabel').textContent = `🔥 x${s.streak}`;
}

function showExplain(q){
  const el = $('quizExplanation');
  let h = '';
  if(q.rule){
    h += `<div style="background:var(--card);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:10px;border:2px solid var(--gold);color:var(--ink);"><strong>📖 Règle :</strong><br>${q.rule}</div>`;
  }
  if(q.steps && q.steps.length){
    h += `<div style="margin-bottom:8px;"><strong>🧩 Étapes :</strong></div><ul style="margin:0;padding-left:20px;line-height:1.6;">`;
    q.steps.forEach(s=>{ h += `<li style="margin-bottom:4px;">${s}</li>`; });
    h += `</ul>`;
  } else if(q.explain){
    h += `<div style="margin-top:6px;"><strong>💡</strong> ${q.explain}</div>`;
  }
  el.innerHTML = h;
  el.classList.add('show');
  rikoSay(msg('explain'),'💡','thinking');
}

function maybeLevelUp(){
  let up = false;
  while(state.xp >= xpNeeded(state.level)){
    state.xp -= xpNeeded(state.level);
    state.level++;
    state.coins += state.level * 10;
    up = true;
    SoundManager.play('levelup');
  }
  if(up){
    rikoSay(msg('levelUp'),'🎉','celebrate');
    unlockZones();
  }
}

$('btnQuizNext').addEventListener('click', ()=>{
  const s = quiz;
  if(!s) return;
  s.index++;
  if(s.index >= s.questions.length) endQuiz();
  else {
    renderQuizQ();
    const msgs = ["Prêt pour la suite ? 💪","On continue ? 🚀","Encore une question ! 🔥"];
    rikoSay(msgs[Math.floor(Math.random()*msgs.length)],'🦊','idle');
  }
});

function endQuiz(){
  const s = quiz;
  if(!s) return;
  if(s.correctCount === s.questions.length) state.stats.perfectQuizzes++;
  window._newBadges = checkBadges();
  save();
  renderReward();
}

function updateDaily(subject){
  const today = new Date().toDateString();
  if(state.dailyChallenges.date !== today){
    state.dailyChallenges.date = today;
    state.dailyChallenges.progress = { math:0, francais:0, anglais:0, sciences:0 };
    state.dailyChallenges.completed = false;
    state.dailyChallenges.rewardClaimed = false;
  }
  if(state.dailyChallenges.progress[subject] !== undefined){
    state.dailyChallenges.progress[subject]++;
  }
  const all = Object.values(state.dailyChallenges.progress).every(v=>v>=3);
  if(all && !state.dailyChallenges.completed){
    state.dailyChallenges.completed = true;
    state.stats.dailyChallengesCompleted++;
    toast('🎉 Défis du jour terminés ! +20 coins !');
    state.coins += 20;
    save();
  }
}

function renderDaily(){
  const today = new Date().toDateString();
  if(state.dailyChallenges.date !== today){
    state.dailyChallenges.date = today;
    state.dailyChallenges.progress = { math:0, francais:0, anglais:0, sciences:0 };
    state.dailyChallenges.completed = false;
    state.dailyChallenges.rewardClaimed = false;
    save();
  }
  const c = $('dailyContent');
  let h = `<div style="margin-bottom:12px;text-align:center;font-weight:700;opacity:.7;">📅 ${new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>`;
  Object.entries(SUBJECTS).forEach(([k, s])=>{
    if(k==='enigmes') return;
    const p = state.dailyChallenges.progress[k] || 0;
    const done = p>=3;
    h += `
      <div class="daily-challenge">
        <div class="dc-left">
          <div class="dc-icon">${s.icon}</div>
          <div>
            <div class="dc-name">${s.name}</div>
            <div class="dc-progress">${p}/3 ${done?'✅':''}</div>
          </div>
        </div>
        <div class="dc-reward">${done?'✅':'🎁 +5 XP'}</div>
      </div>`;
  });
  const all = Object.values(state.dailyChallenges.progress).every(v=>v>=3);
  if(all && !state.dailyChallenges.rewardClaimed){
    h += `<div style="background:var(--gold);border-radius:var(--radius-md);padding:14px;text-align:center;font-family:var(--font-display);font-weight:700;color:#5C3A00;">🎉 Tous terminés ! +20 coins bonus !</div>`;
    state.dailyChallenges.rewardClaimed = true;
    save();
  }
  c.innerHTML = h;
  setHUD(false);
  showScreen('screen-daily');
}
$('btnDailyChallenge').addEventListener('click', renderDaily);
$('btnDailyBack').addEventListener('click', ()=>{ state.created ? renderMap() : renderHome(); });

function openRevision(){
  const l = $('revisionList');
  const w = state.stats.wrongQuestions;
  if(w.length===0){
    l.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:var(--card);border-radius:var(--radius-lg);box-shadow:var(--shadow-hard);">
        <div style="font-size:48px;margin-bottom:12px;">🌟</div>
        <h3 style="font-family:var(--font-display);color:var(--plum-dark);">Aucune erreur enregistrée</h3>
        <p style="font-weight:600;opacity:.6;">Continue comme ça !</p>
      </div>`;
  } else {
    l.innerHTML = w.map((x,i)=>`
      <div class="revision-item">
        <div class="ri-question">${i+1}. ${x.question}</div>
        <div class="ri-answer">✅ ${x.correctAnswer}</div>
      </div>`).join('');
  }
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  showScreen('screen-revision');
}
$('btnRevisionBack').addEventListener('click', renderMap);

let tState = { q:null, answered:false };

function openTreasure(){
  tState.q = null;
  tState.answered = false;
  renderTreasure();
}

function renderTreasure(){
  const c = $('treasureContent');
  let h = '<div class="treasure-grid">';
  for(let i=0;i<16;i++){
    const f = state.treasureFound.includes(i);
    h += `<div class="treasure-cell ${f?'found':''}" onclick="treasureClick(${i})">${f?'🪙':'❓'}</div>`;
  }
  h += '</div>';
  h += `<div style="text-align:center;margin-top:12px;font-weight:700;">🪙 ${state.treasureFound.length}/16 trésors</div>`;
  if(tState.q){
    const q = tState.q;
    h += `<div style="background:var(--card);border-radius:var(--radius-lg);padding:16px;margin-top:12px;box-shadow:var(--shadow-hard);">
      <div style="font-family:var(--font-display);font-size:18px;margin-bottom:12px;">${q.question}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${q.choices.map((c,i)=>`<button onclick="treasureAnswer(${i})" style="background:#F1F3F9;border:none;border-radius:var(--radius-md);padding:12px;font-family:var(--font-body);font-weight:700;font-size:15px;cursor:pointer;">${c}</button>`).join('')}
      </div></div>`;
  }
  c.innerHTML = h;
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  showScreen('screen-treasure');
}

function treasureClick(i){
  if(state.treasureFound.includes(i)){ toast('🏆 Déjà trouvé !'); return; }
  if(tState.q){ toast("Réponds d'abord !"); return; }
  const bank = [...FR, ...EN, ...SCI];
  const q = pickN(bank,1)[0];
  const shuf = shuffle(q.choices);
  const right = q.choices[q.correctIndex];
  tState.q = { question:q.q, choices:shuf, correctIndex:shuf.indexOf(right), cellIndex:i };
  tState.answered = false;
  renderTreasure();
}

function treasureAnswer(idx){
  if(tState.answered) return;
  tState.answered = true;
  const q = tState.q;
  if(idx===q.correctIndex){
    state.treasureFound.push(q.cellIndex);
    state.stats.treasuresFound = state.treasureFound.length;
    SoundManager.play('treasure');
    toast('🎉 Trésor trouvé ! +10 XP !');
    state.xp += 10;
    save();
    refreshHUD();
  } else toast('❌ Mauvaise réponse.');
  tState.q = null;
  setTimeout(renderTreasure, 800);
}
window.treasureClick = treasureClick;
window.treasureAnswer = treasureAnswer;
$('btnTreasureBack').addEventListener('click', renderMap);

function checkBadges(){
  const n = [];
  BADGES.forEach(b=>{
    if(!state.badges.includes(b.id) && b.check(state)){
      state.badges.push(b.id);
      n.push(b);
    }
  });
  return n;
}

function renderReward(){
  const s = quiz;
  if(!s) return;
  const sub = SUBJECTS[s.subjectKey];
  const pct = Math.round((s.correctCount/s.questions.length)*100);

  $('rewardBurstIcon').textContent = '🏆';
  $('rewardTitle').textContent = pct>=80 ? '🌟 Excellent !' : '👍 Bien joué !';
  $('rewardSubtitle').textContent = `${sub.name} — ${s.correctCount}/${s.questions.length} (${pct}%)`;

  $('rewardStatsRow').innerHTML = `
    <div class="hud-pill"><span class="ico">⚡</span>+${s.earnedXp} XP</div>
    <div class="hud-pill"><span class="ico">🪙</span>+${s.earnedCoins}</div>`;

  const ba = $('rewardBadgeArea');
  ba.innerHTML = '';
  if(window._newBadges && window._newBadges.length){
    window._newBadges.forEach(b=>{
      const el = document.createElement('div');
      el.style.cssText = 'background:var(--card);border-radius:var(--radius-md);padding:10px 16px;display:flex;align-items:center;gap:8px;box-shadow:var(--shadow-soft);font-family:var(--font-display);font-weight:700;color:var(--plum-dark);margin-top:6px;';
      el.innerHTML = `<span style="font-size:24px;">${b.icon}</span><span>Nouveau badge : ${b.name} !</span>`;
      ba.appendChild(el);
    });
  }

  if(pct>=80) rikoSay(msg('endGood'),'🏆','proud');
  else if(pct>=50) rikoSay(msg('endOk'),'💪','motivated');
  else rikoSay(msg('endWeak'),'❤️','sad');

  refreshHUD();
  showScreen('screen-reward');
}
$('btnRewardContinue').addEventListener('click', renderMap);

function openShop(){
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  switchTab('house');
  showScreen('screen-shop');
}

function switchTab(t){
  $('tabHouse').classList.toggle('active', t==='house');
  $('tabShop').classList.toggle('active', t==='shop');
  $('houseView').classList.toggle('hidden', t!=='house');
  $('shopView').classList.toggle('hidden', t!=='shop');
  t==='house' ? renderHouse() : renderShop();
}
$('tabHouse').addEventListener('click', ()=>switchTab('house'));
$('tabShop').addEventListener('click', ()=>switchTab('shop'));

function renderHouse(){
  const el = $('houseView');
  const hat = curHat();
  const pet = SHOP_ITEMS.find(i=>i.id===state.house.pet);
  const decos = state.house.decorations.map(id=>SHOP_ITEMS.find(i=>i.id===id)).filter(Boolean);

  el.innerHTML = `
    <div class="house-scene">
      <div style="position:relative;display:inline-block;">
        <svg width="100" height="100" viewBox="0 0 200 200">${avatarSVG(curColor(), curEmoji(), 200)}</svg>
        ${hat?`<div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);font-size:24px;">${hat}</div>`:''}
      </div>
      ${pet?`<div class="house-pet">${pet.icon}</div>`:''}
      <div class="house-furniture">${decos.map(d=>`<span>${d.icon}</span>`).join('')}</div>
      <div class="house-floor"></div>
    </div>
    <div class="section-title">Objets possédés</div>
    <div class="shop-grid" id="ownedGrid"></div>`;

  const og = $('ownedGrid');
  const owned = SHOP_ITEMS.filter(i=>state.shopOwned.includes(i.id));
  if(owned.length===0){
    og.innerHTML = `<p style="grid-column:1/-1;text-align:center;font-weight:700;opacity:.6;font-size:13px;">Va à la boutique acheter tes premiers objets ! 🛍️</p>`;
    return;
  }
  owned.forEach(it=>{
    const eq = isEquipped(it);
    const card = document.createElement('div');
    card.className = 'shop-item' + (eq?' owned':'');
    card.innerHTML = `
      <div class="s-ico">${it.icon}</div>
      <div class="s-name">${it.name}</div>
      <button class="shop-buy-btn ${eq?'equipped':''}">${eq?'✓ Équipé':'Équiper'}</button>`;
    card.querySelector('button').onclick = ()=>{ equip(it); renderHouse(); };
    og.appendChild(card);
  });
}

function isEquipped(it){
  if(it.cat==='pet') return state.house.pet===it.id;
  if(it.cat==='decoration') return state.house.decorations.includes(it.id);
  return state.shopEquipped[it.cat]===it.id;
}

function equip(it){
  if(it.cat==='pet'){
    state.house.pet = state.house.pet===it.id ? null : it.id;
  } else if(it.cat==='decoration'){
    const i = state.house.decorations.indexOf(it.id);
    if(i>=0) state.house.decorations.splice(i,1);
    else {
      if(state.house.decorations.length>=3) state.house.decorations.shift();
      state.house.decorations.push(it.id);
    }
  } else {
    state.shopEquipped[it.cat] = state.shopEquipped[it.cat]===it.id ? null : it.id;
  }
  save();
}

function renderShop(){
  const el = $('shopView');
  el.innerHTML = `<div class="section-title">🪙 Tu as ${state.coins} pièces</div><div class="shop-grid" id="shopGrid"></div>`;
  const g = $('shopGrid');
  SHOP_ITEMS.forEach(it=>{
    const owned = state.shopOwned.includes(it.id);
    const card = document.createElement('div');
    card.className = 'shop-item' + (owned?' owned':'');
    card.innerHTML = `
      <div class="s-ico">${it.icon}</div>
      <div class="s-name">${it.name}</div>
      <div class="s-price">🪙 ${it.price}</div>
      <button class="shop-buy-btn" ${owned||state.coins<it.price?'disabled':''}>${owned?'✓ Possédé':'Acheter'}</button>`;
    if(!owned){
      card.querySelector('button').onclick = ()=>{
        if(state.coins < it.price){ toast('Pas assez de pièces 🪙'); return; }
        state.coins -= it.price;
        state.shopOwned.push(it.id);
        save(); refreshHUD();
        toast(`🎉 Acheté : ${it.name} !`);
        renderShop();
      };
    }
    g.appendChild(card);
  });
}

function openBadges(){
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  const g = $('badgesGrid');
  g.innerHTML = '';
  BADGES.forEach(b=>{
    const got = state.badges.includes(b.id);
    const c = document.createElement('div');
    c.className = 'badge-card' + (got?' earned':'');
    c.innerHTML = `<div class="b-ico">${b.icon}</div><div class="b-name">${b.name}</div>`;
    g.appendChild(c);
  });
  showScreen('screen-badges');
}

function renderParentDashboard(){
  const s = state.stats;
  const rate = s.questionsAnswered>0 ? Math.round((s.correctAnswers/s.questionsAnswered)*100) : 0;
  const c = $('parentDashboardContent');
  const sn = state.schoolLevel && SCHOOL_LEVELS[state.schoolLevel] ? SCHOOL_LEVELS[state.schoolLevel].name : 'Non défini';

  const rows = Object.values(SUBJECTS).filter(x=>x.key!=='enigmes').map(sub=>{
    const st = s.bySubject[sub.key];
    const r = st.asked>0 ? Math.round((st.correct/st.asked)*100) : 0;
    return `
      <div class="subject-bar-row">
        <div class="lbl"><span>${sub.icon} ${sub.name}</span><span>${st.correct}/${st.asked}</span></div>
        <div class="subject-bar"><div class="subject-bar-fill" style="width:${r}%;background:${sub.color};"></div></div>
      </div>`;
  }).join('');

  c.innerHTML = `
    ${state.created?`<div class="stat-card"><span class="label">Héros</span><span class="value">${state.name}</span></div>`:''}
    <div class="stat-card"><span class="label">Classe scolaire</span><span class="value">🏫 ${sn}</span></div>
    <div class="stat-card"><span class="label">Niveau d'aventure</span><span class="value">⭐ ${state.level}</span></div>
    <div class="stat-card"><span class="label">XP total</span><span class="value">⚡ ${state.xp} / ${xpNeeded(state.level)}</span></div>
    <div class="stat-card"><span class="label">Questions répondues</span><span class="value">${s.questionsAnswered}</span></div>
    <div class="stat-card"><span class="label">Taux de réussite</span><span class="value">${rate}%</span></div>
    <div class="stat-card"><span class="label">Meilleure série</span><span class="value">🔥 ${s.bestStreak}</span></div>
    <div class="stat-card"><span class="label">Quiz parfaits</span><span class="value">💯 ${s.perfectQuizzes}</span></div>
    <div class="stat-card"><span class="label">Trésors trouvés</span><span class="value">🏴‍☠️ ${s.treasuresFound}/16</span></div>
    <div class="stat-card"><span class="label">Défis du jour</span><span class="value">📅 ${s.dailyChallengesCompleted}</span></div>
    <div class="stat-card"><span class="label">Badges obtenus</span><span class="value">🎖️ ${state.badges.length}/${BADGES.length}</span></div>
    <div class="section-title">Progression par matière</div>
    ${rows}
    <div class="section-title">Confidentialité</div>
    <p style="font-weight:700;font-size:13px;opacity:.7;line-height:1.5;">
      Aucune donnée personnelle collectée.<br>
      Tout est stocké localement sur l'appareil.
    </p>`;
  setHUD(false);
  showScreen('screen-parent-dashboard');
}
$('btnParentExit').addEventListener('click', ()=>{ state.created?renderMap():renderHome(); });

const Music = {
  ctx:null, gain:null, muted:false, vol:0.3, playing:false, tId:null,
  melody:[523,587,659,587,523,494,523,587,659,784,659,587,523,494,440,494],
  idx:0,
  init(){
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.muted ? 0 : this.vol*0.08;
      this.gain.connect(this.ctx.destination);
      this.loadPrefs();
      this.updateUI();
    } catch(e){}
  },
  start(){
    if(this.muted || !this.ctx || this.playing) return;
    this.playing = true;
    this.idx = 0;
    this.sched(0);
  },
  sched(t){
    if(!this.playing || this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime + t;
      const v = this.muted ? 0 : this.vol*0.08;
      [523,659,784].forEach((f,i)=>{
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type='sine'; o.frequency.value=f;
        g.gain.value=v*0.5;
        o.connect(g); g.connect(this.gain);
        o.start(now+i*0.06); o.stop(now+1.8);
      });
      const f = this.melody[this.idx%this.melody.length];
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type='sine'; o2.frequency.value=f;
      g2.gain.value=v*0.4;
      o2.connect(g2); g2.connect(this.gain);
      o2.start(now+0.15); o2.stop(now+0.35);
      this.idx++;
      const d = 0.5 + Math.random()*0.3;
      this.tId = setTimeout(()=>this.sched(t+d), d*1000);
    } catch(e){}
  },
  stop(){
    this.playing = false;
    if(this.tId){ clearTimeout(this.tId); this.tId = null; }
  },
  toggle(){
    if(!this.ctx) this.init();
    if(!this.ctx) return;
    this.muted = !this.muted;
    if(this.gain) this.gain.gain.value = this.muted ? 0 : this.vol*0.08;
    if(this.muted) this.stop();
    else {
      if(this.ctx.state==='suspended') this.ctx.resume();
      this.start();
    }
    this.savePrefs();
    this.updateUI();
  },
  setVol(v){
    this.vol = Math.max(0, Math.min(1, v/100));
    if(this.gain) this.gain.gain.value = this.muted ? 0 : this.vol*0.08;
    this.savePrefs();
  },
  savePrefs(){
    try { localStorage.setItem('advMusic', JSON.stringify({muted:this.muted,volume:this.vol})); } catch(e){}
  },
  loadPrefs(){
    try {
      const s = localStorage.getItem('advMusic');
      if(s){
        const p = JSON.parse(s);
        this.muted = p.muted || false;
        this.vol = p.volume || 0.3;
        const sl = document.getElementById('musicVolume');
        if(sl) sl.value = this.vol*100;
      }
    } catch(e){}
  },
  updateUI(){
    const b = document.getElementById('musicToggleBtn');
    if(b) b.classList.toggle('muted', this.muted);
  }
};

document.addEventListener('DOMContentLoaded', ()=>{
  const tb = document.getElementById('musicToggleBtn');
  const vs = document.getElementById('musicVolume');
  if(tb) tb.addEventListener('click', e=>{ e.stopPropagation(); Music.toggle(); });
  if(vs) vs.addEventListener('input', function(){ Music.setVol(parseFloat(this.value)); });

  const start = ()=>{
    if(!Music.ctx) Music.init();
    if(!Music.playing && !Music.muted && Music.ctx){
      if(Music.ctx.state==='suspended') Music.ctx.resume();
      Music.start();
    }
    document.removeEventListener('click', start);
    document.removeEventListener('touchstart', start);
  };
  document.addEventListener('click', start);
  document.addEventListener('touchstart', start);
});

function init(){
  const has = load();
  unlockZones();
  if(!state.parentPin){ startParentOnboarding(); return; }
  if(has && state.created){
    if(!state.schoolLevel){ toast('Bienvenue ! Choisis ta classe 🏫'); renderCreator(); }
    else renderHome();
  } else {
    state = defaultState();
    state.parentPin = has ? state.parentPin : null;
    renderHome();
  }
}
init();