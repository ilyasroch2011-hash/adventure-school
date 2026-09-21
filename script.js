/* ===========================================================
   ADVENTURE SCHOOL — MOTEUR COMPLET V2.0 (EXPLICATIF CORRIGÉ)
   =========================================================== */

// ============================================================
// 1. CONSTANTES & CONFIGURATION
// ============================================================
const SAVE_KEY = 'adventureSchoolSave_v2';

const AVATAR_CHOICES = ['🧑‍🚀','🦸','🧙','🥷','🧝','🐉','🦄','🧑‍🎤'];
const COLOR_CHOICES = ['#FF6F59','#5EC6E8','#57C46B','#FFC93C','#5B3A8E','#FF9FCF','#2E9E4A','#26324A'];

const SUBJECTS = {
  math:      { key:'math',      name:'Château des Maths',     icon:'🏰', desc:"Résous des défis numériques pour gagner de l'XP !", color:'var(--coral)' },
  francais:  { key:'francais',  name:'Village du Français',   icon:'📚', desc:"Vocabulaire, conjugaison et orthographe t'attendent !", color:'var(--plum)' },
  anglais:   { key:'anglais',   name:"Royaume de l'Anglais",  icon:'🇬🇧', desc:"Apprends de nouveaux mots en anglais !", color:'#3B6FD6' },
  sciences:  { key:'sciences',  name:'Laboratoire des Sciences', icon:'🔬', desc:"Découvre les secrets de la nature et de l'univers !", color:'#2E9E4A' },
  enigmes:   { key:'enigmes',   name:'Forêt des Énigmes',     icon:'🌲', desc:"Un mélange de défis pour les plus grands aventuriers !", color:'#7A5230' },
};

const ZONE_UNLOCK_LEVEL = { math:1, francais:2, anglais:3, sciences:4, enigmes:5 };

const SCHOOL_LEVELS = {
  cp:  { name: 'CP',  age: '6-7 ans', difficulty: 1 },
  ce1: { name: 'CE1', age: '7-8 ans', difficulty: 2 },
  ce2: { name: 'CE2', age: '8-9 ans', difficulty: 3 },
  cm1: { name: 'CM1', age: '9-10 ans', difficulty: 4 },
  cm2: { name: 'CM2', age: '10-11 ans', difficulty: 5 },
  '6e': { name: '6e', age: '11-12 ans', difficulty: 6 },
  '5e': { name: '5e', age: '12-13 ans', difficulty: 7 },
  '4e': { name: '4e', age: '13-14 ans', difficulty: 8 },
  '3e': { name: '3e', age: '14-15 ans', difficulty: 9 },
};

// ============================================================
// 2. BADGES
// ============================================================
const BADGES = [
  { id:'first_quiz',  name:'Premier défi',      icon:'🏆', check: s => s.stats.questionsAnswered >= 1 },
  { id:'math_genius', name:'Génie des maths',    icon:'🧠', check: s => (s.stats.bySubject.math.correct) >= 20 },
  { id:'reader',      name:'Lecteur',            icon:'📚', check: s => (s.stats.bySubject.francais.correct) >= 20 },
  { id:'linguist',    name:'Linguiste',          icon:'🗣️', check: s => (s.stats.bySubject.anglais.correct) >= 20 },
  { id:'scientist',   name:'Petit scientifique', icon:'🔬', check: s => (s.stats.bySubject.sciences.correct) >= 20 },
  { id:'explorer',    name:'Explorateur',        icon:'🌍', check: s => Object.keys(ZONE_UNLOCK_LEVEL).every(z => s.zonesUnlocked[z]) },
  { id:'streak_master', name:'Maître de la série', icon:'🔥', check: s => s.stats.bestStreak >= 5 },
  { id:'daily_champ', name:'Champion du jour', icon:'📅', check: s => s.stats.dailyChallengesCompleted >= 5 },
  { id:'treasure_hunter', name:'Chasseur de trésors', icon:'🏴‍☠️', check: s => s.stats.treasuresFound >= 16 },
  { id:'perfect_quiz', name:'Quiz parfait', icon:'💯', check: s => s.stats.perfectQuizzes >= 3 },
];

// ============================================================
// 3. SHOP ITEMS
// ============================================================
const SHOP_ITEMS = [
  { id:'hat_wizard',   name:'Chapeau Magicien', icon:'🎩', price:40,  cat:'hat' },
  { id:'hat_crown',    name:'Couronne',         icon:'👑', price:120, cat:'hat' },
  { id:'hat_cap',      name:'Casquette',        icon:'🧢', price:25,  cat:'hat' },
  { id:'shoes_boots',  name:'Bottes d\'aventure',icon:'👢', price:35, cat:'shoes' },
  { id:'shoes_sneak',  name:'Baskets',          icon:'👟', price:30,  cat:'shoes' },
  { id:'acc_glasses',  name:'Lunettes',         icon:'🕶️', price:20,  cat:'accessory' },
  { id:'acc_wand',     name:'Baguette magique', icon:'🪄', price:60,  cat:'accessory' },
  { id:'acc_shield',   name:'Bouclier',         icon:'🛡️', price:70,  cat:'accessory' },
  { id:'deco_plant',   name:'Plante verte',     icon:'🪴', price:20,  cat:'decoration' },
  { id:'deco_lamp',    name:'Lampe magique',    icon:'🏮', price:30,  cat:'decoration' },
  { id:'deco_carpet',  name:'Tapis volant',     icon:'🧞', price:90,  cat:'decoration' },
  { id:'deco_trophy',  name:'Trophée doré',     icon:'🏆', price:110, cat:'decoration' },
  { id:'pet_cat',      name:'Chat',             icon:'🐱', price:50,  cat:'pet' },
  { id:'pet_dog',      name:'Chien',            icon:'🐶', price:50,  cat:'pet' },
  { id:'pet_dragon',   name:'Bébé dragon',      icon:'🐲', price:200, cat:'pet' },
  { id:'pet_owl',      name:'Hibou',            icon:'🦉', price:80,  cat:'pet' },
];

// ============================================================
// 4. GESTIONNAIRE DE SONS
// ============================================================
const SoundManager = {
  ctx: null,
  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) { console.warn('Audio non disponible'); }
    }
  },
  play(type) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      gain.gain.value = 0.12;
      const now = this.ctx.currentTime;
      
      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'levelup') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.15);
        osc.frequency.setValueAtTime(659, now + 0.3);
        osc.frequency.setValueAtTime(880, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'treasure') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(784, now + 0.16);
        osc.frequency.setValueAtTime(1047, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch(e) { /* silencieux */ }
  }
};

// ============================================================
// 5. RIKO MESSAGES
// ============================================================
const RIKO_MESSAGES = {
  welcome: ["Prêt pour un défi ? 💪", "Une nouvelle aventure t'attend ! 🦊", "On va apprendre en s'amusant ! 🎮"],
  correct: ["Bien joué ! 🎉", "Excellent ! 🌟", "Tu as trouvé ! 👏", "Bravo ! 🏆", "Super réflexion ! 💡"],
  wrong: ["Pas grave, on va comprendre ensemble 🤔", "Tu étais proche ! 💪", "Une erreur, c'est une occasion de comprendre ❤️"],
  explain: ["Regardons ensemble comment trouver la réponse 💡", "Suis-moi, on va décomposer le problème 🧩"],
  levelUp: ["WAOUH ! Tu viens de passer un niveau ! 🎉", "Niveau supérieur ! Tu progresses ! ⭐"],
  endGood: ["Incroyable performance ! 🎉", "Tu as assuré aujourd'hui ! 🏆"],
  endOk: ["Très bien ! Continue comme ça ! 💪", "Bien joué ! On progresse ! 🔥"],
  endWeak: ["Ce n'est pas grave. On sait maintenant quoi travailler ❤️", "On va s'entraîner sur ces points 💪"]
};

function getRikoMessage(cat) {
  const msgs = RIKO_MESSAGES[cat] || ["Hmm 🤔"];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// ============================================================
// 6. ÉTAT / SAUVEGARDE
// ============================================================
function defaultState(){
  return {
    created: false,
    name: '', gender: 'neutre', avatarIndex: 0, colorIndex: 0,
    schoolLevel: null,
    parentPin: null,
    level: 1, xp: 0, coins: 20,
    zonesUnlocked: { math: true, francais: false, anglais: false, sciences: false, enigmes: false },
    badges: [],
    shopOwned: [],
    shopEquipped: { hat: null, shoes: null, accessory: null },
    house: { pet: null, decorations: [] },
    treasureFound: [],
    stats: {
      questionsAnswered: 0,
      correctAnswers: 0,
      bestStreak: 0,
      perfectQuizzes: 0,
      treasuresFound: 0,
      dailyChallengesCompleted: 0,
      bySubject: {
        math: { asked: 0, correct: 0 },
        francais: { asked: 0, correct: 0 },
        anglais: { asked: 0, correct: 0 },
        sciences: { asked: 0, correct: 0 },
        enigmes: { asked: 0, correct: 0 }
      },
      wrongQuestions: [],
      playSeconds: 0
    },
    dailyChallenges: {
      date: null,
      progress: { math: 0, francais: 0, anglais: 0, sciences: 0 },
      completed: false,
      rewardClaimed: false
    },
    firstPlayedAt: Date.now()
  };
}

let state = defaultState();

function save(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
  catch(e) { console.warn('Sauvegarde impossible', e); }
}

function load(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      state = Object.assign(defaultState(), parsed);
      state.zonesUnlocked = Object.assign(defaultState().zonesUnlocked, parsed.zonesUnlocked||{});
      state.stats = Object.assign(defaultState().stats, parsed.stats||{});
      state.stats.bySubject = Object.assign(defaultState().stats.bySubject, (parsed.stats&&parsed.stats.bySubject)||{});
      state.stats.wrongQuestions = parsed.stats?.wrongQuestions || [];
      state.shopEquipped = Object.assign(defaultState().shopEquipped, parsed.shopEquipped||{});
      state.house = Object.assign(defaultState().house, parsed.house||{});
      state.dailyChallenges = Object.assign(defaultState().dailyChallenges, parsed.dailyChallenges||{});
      state.treasureFound = Array.isArray(parsed.treasureFound) ? parsed.treasureFound : [];
      if (!state.schoolLevel || !SCHOOL_LEVELS[state.schoolLevel]) state.schoolLevel = null;
      return true;
    }
  } catch(e) { console.warn('Lecture impossible', e); }
  return false;
}

function xpNeededForLevel(level){ return 100 + (level-1)*40; }

// ============================================================
// 7. UTILITAIRES
// ============================================================
function $(id){ return document.getElementById(id); }
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(id).classList.remove('hidden');
  window.scrollTo(0,0);
}
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function pickN(arr, n){ return shuffle(arr).slice(0, Math.min(n, arr.length)); }

function toast(msg){
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=> t.classList.remove('show'), 2200);
}

function setHUDVisible(visible){
  $('hud').classList.toggle('hidden', !visible);
  $('hudXpBarWrap').classList.toggle('hidden', !visible);
}

function refreshHUD(){
  const schoolName = state.schoolLevel && SCHOOL_LEVELS[state.schoolLevel] ? SCHOOL_LEVELS[state.schoolLevel].name : '?';
  $('hudSchoolLevel').textContent = schoolName;
  $('hudLevel').textContent = state.level;
  $('hudXp').textContent = state.xp;
  $('hudCoins').textContent = state.coins;
  const need = xpNeededForLevel(state.level);
  $('hudXpBarFill').style.width = Math.min(100, (state.xp/need)*100) + '%';
}

function avatarSVG(colorHex, emoji, size){
  size = size || 200;
  return `<circle cx="${size/2}" cy="${size/2}" r="${size/2-4}" fill="${colorHex}22" stroke="${colorHex}" stroke-width="6"></circle>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="${size*0.55}">${emoji}</text>`;
}
function currentAvatarEmoji(){ return AVATAR_CHOICES[state.avatarIndex] || AVATAR_CHOICES[0]; }
function currentAvatarColor(){ return COLOR_CHOICES[state.colorIndex] || COLOR_CHOICES[0]; }
function equippedHatEmoji(){
  const id = state.shopEquipped.hat;
  const item = SHOP_ITEMS.find(i=>i.id===id);
  return item ? item.icon : '';
}

// ============================================================
// 7B. NAVIGATION HISTORIQUE
// ============================================================
let isHistoryNav = false;

function goToScreen(screenKey, data, renderFn){
  renderFn();
  if(!isHistoryNav){
    try { history.pushState({ screenKey, data: data || null }, '', '#' + screenKey); }
    catch(e) { /* environnement sans History API */ }
  }
}

function renderFromNavState(navState){
  isHistoryNav = true;
  try {
    if(!navState || !navState.screenKey){ renderHome(); return; }
    const data = navState.data || {};
    switch(navState.screenKey){
      case 'home': renderHome(); break;
      case 'creator': renderCreator(); break;
      case 'map': state.created ? renderMap() : renderHome(); break;
      case 'subject-intro': (data.subject && SUBJECTS[data.subject]) ? openSubjectIntro(data.subject) : renderMap(); break;
      case 'shop': openShop(); break;
      case 'badges': openBadges(); break;
      case 'daily': renderDailyChallenges(); break;
      case 'revision': openRevision(); break;
      case 'treasure': openTreasure(); break;
      case 'parent-gate': openParentGate(); break;
      case 'parent-dashboard': state.parentPin ? renderParentDashboard() : renderHome(); break;
      default: renderHome();
    }
  } finally {
    isHistoryNav = false;
  }
}

window.addEventListener('popstate', (e)=>{ renderFromNavState(e.state); });

// ============================================================
// 8. RIKO COMPANION
// ============================================================
function setRikoState(emoji, className, message) {
  const avatar = $('rikoAvatar');
  const speech = $('rikoSpeech');
  if (avatar) {
    avatar.textContent = emoji || '🦊';
    avatar.className = 'riko-avatar ' + (className || 'idle');
    void avatar.offsetWidth;
    avatar.classList.add(className || 'idle');
  }
  if (speech && message) speech.textContent = message;
}

function rikoSay(message, emoji, className){
  setRikoState(emoji || '🦊', className || 'idle', message);
}

function rikoCorrect(){ rikoSay(getRikoMessage('correct'), '🦊', 'happy'); SoundManager.play('correct'); }
function rikoWrong(){ rikoSay(getRikoMessage('wrong'), '🦊', 'sad'); SoundManager.play('wrong'); }
function rikoExplain(){ rikoSay(getRikoMessage('explain'), '💡', 'thinking'); }
function rikoCelebrate(){ rikoSay(getRikoMessage('correct'), '🎉', 'celebrate'); SoundManager.play('levelup'); }

// ============================================================
// 9. PARENT PIN
// ============================================================
function getPinFromInputs(containerId){
  const inputs = document.querySelectorAll(`#${containerId} .pin-input`);
  let pin='';
  inputs.forEach(inp=>{ pin += inp.value; });
  return pin;
}

function setupPinInputs(containerId, onComplete){
  const container = document.getElementById(containerId);
  const inputs = container.querySelectorAll('.pin-input');
  inputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
      this.value = this.value.replace(/\D/g, '');
      if (this.value.length === 1 && index < inputs.length - 1) inputs[index + 1].focus();
      const pin = getPinFromInputs(containerId);
      if (onComplete) onComplete(pin);
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && this.value === '' && index > 0) inputs[index - 1].focus();
      if (e.key === 'Enter') {
        const pin = getPinFromInputs(containerId);
        if (onComplete) onComplete(pin);
      }
    });
    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const digits = pasted.replace(/\D/g, '').slice(0, 4);
      if(digits){
        const chars = digits.split('');
        inputs.forEach((inp, i) => { if(i < chars.length) inp.value = chars[i]; });
        if(chars.length < inputs.length) inputs[chars.length].focus();
        else inputs[inputs.length-1].focus();
        if(onComplete) onComplete(getPinFromInputs(containerId));
      }
    });
  });
}

function clearPinInputs(containerId){
  const inputs = document.querySelectorAll(`#${containerId} .pin-input`);
  inputs.forEach(inp => inp.value = '');
  if(inputs.length) inputs[0].focus();
}

// ============================================================
// 10. PARENT ONBOARDING
// ============================================================
let pendingPin = '';

function startParentOnboarding(){ showScreen('screen-parent-welcome'); }

$('btnParentWelcomeContinue').addEventListener('click', ()=>{
  showScreen('screen-parent-create-pin');
  clearPinInputs('pinCreateContainer');
  document.getElementById('pinCreateError').textContent = '';
  document.getElementById('btnParentCreatePin').disabled = true;
  setupPinInputs('pinCreateContainer', (pin) => {
    document.getElementById('btnParentCreatePin').disabled = pin.length !== 4;
  });
});

$('btnParentCreatePin').addEventListener('click', ()=>{
  const pin = getPinFromInputs('pinCreateContainer');
  if(pin.length === 4){
    pendingPin = pin;
    showScreen('screen-parent-confirm-pin');
    clearPinInputs('pinConfirmContainer');
    document.getElementById('pinConfirmError').textContent = '';
    document.getElementById('btnParentConfirmPin').disabled = true;
    setupPinInputs('pinConfirmContainer', (pin) => {
      document.getElementById('btnParentConfirmPin').disabled = pin.length !== 4;
    });
  }
});

$('btnParentConfirmPin').addEventListener('click', ()=>{
  const confirmPin = getPinFromInputs('pinConfirmContainer');
  if(confirmPin === pendingPin){
    state.parentPin = pendingPin;
    save();
    pendingPin = '';
    goToGame();
  } else {
    document.getElementById('pinConfirmError').textContent = '❌ Les codes ne correspondent pas.';
    clearPinInputs('pinConfirmContainer');
    document.getElementById('btnParentConfirmPin').disabled = true;
  }
});

// ============================================================
// 11. PARENT GATE
// ============================================================
function openParentGate(){
  showScreen('screen-parent-gate');
  clearPinInputs('pinGateContainer');
  document.getElementById('pinGateError').textContent = '';
  document.getElementById('btnParentGateUnlock').disabled = true;
  setupPinInputs('pinGateContainer', (pin) => {
    document.getElementById('btnParentGateUnlock').disabled = pin.length !== 4;
  });
}

$('btnParentGateUnlock').addEventListener('click', ()=>{
  const entered = getPinFromInputs('pinGateContainer');
  if(entered === state.parentPin){
    renderParentDashboard();
  } else {
    document.getElementById('pinGateError').textContent = '❌ Code incorrect.';
    clearPinInputs('pinGateContainer');
    document.getElementById('btnParentGateUnlock').disabled = true;
  }
});

$('btnParentGateBack').addEventListener('click', ()=>{
  if(state.created) renderMap();
  else renderHome();
});

// ============================================================
// 12. GAME ENTRY
// ============================================================
function goToGame(){
  if(state.created && state.schoolLevel) renderHome();
  else renderHome();
}

// ============================================================
// 13. HOME
// ============================================================
function renderHome(){
  setHUDVisible(false);
  $('homeAvatar').innerHTML = avatarSVG(currentAvatarColor(), currentAvatarEmoji(), 200);
  const statsRow = $('homeStatsRow');
  if(state.created){
    const schoolName = state.schoolLevel && SCHOOL_LEVELS[state.schoolLevel] ? SCHOOL_LEVELS[state.schoolLevel].name : '?';
    statsRow.innerHTML = `
      <div class="hud-pill"><span class="ico">🏫</span>${schoolName}</div>
      <div class="hud-pill"><span class="ico">⭐</span>Niv.${state.level}</div>
      <div class="hud-pill"><span class="ico">⚡</span>${state.xp}</div>
      <div class="hud-pill"><span class="ico">🪙</span>${state.coins}</div>
    `;
    $('btnContinue').classList.remove('hidden');
    $('btnContinue').textContent = `🔄 Continuer, ${state.name} !`;
    $('btnPlay').textContent = '▶️ Nouvelle partie';
  } else {
    statsRow.innerHTML = '';
    $('btnContinue').classList.add('hidden');
    $('btnPlay').textContent = '▶️ Jouer';
  }
  showScreen('screen-home');
}

let startingFreshGame = false;
$('btnPlay').addEventListener('click', ()=>{
  if(state.created){
    const ok = confirm('Ceci va créer une nouvelle partie et effacer la progression actuelle. Continuer ?');
    if(!ok) return;
    startingFreshGame = true;
  } else {
    startingFreshGame = true;
  }
  renderCreator();
});
$('btnContinue').addEventListener('click', ()=>{
  if(!state.schoolLevel){ toast('Choisis d\'abord ta classe ! 🏫'); renderCreator(); return; }
  renderMap();
});
$('btnParents').addEventListener('click', ()=>{
  if(state.parentPin) openParentGate();
  else toast('Aucun code parent configuré.');
});

// ============================================================
// 14. CREATOR
// ============================================================
let creatorDraft = { name:'', gender:'neutre', avatarIndex:0, colorIndex:0, schoolLevel:null };

function renderCreator(){
  creatorDraft = {
    name: state.name || '',
    gender: state.gender || 'neutre',
    avatarIndex: state.avatarIndex || 0,
    colorIndex: state.colorIndex || 0,
    schoolLevel: state.schoolLevel || null
  };
  $('inputName').value = creatorDraft.name;

  const select = $('schoolLevelSelect');
  select.innerHTML = '<option value="">-- Choisis ta classe --</option>';
  Object.entries(SCHOOL_LEVELS).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${val.name} (${val.age})`;
    if(creatorDraft.schoolLevel === key) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener('change', (e) => {
    creatorDraft.schoolLevel = e.target.value || null;
  });

  const genderRow = $('genderRow');
  genderRow.innerHTML = '';
  [['garcon','Garçon'],['fille','Fille'],['neutre','Neutre']].forEach(([val,label])=>{
    const chip = document.createElement('button');
    chip.className = 'option-chip' + (creatorDraft.gender===val ? ' selected' : '');
    chip.textContent = label;
    chip.style.cssText = `padding:8px 14px; border-radius:999px; background:#F1F3F9; font-weight:700; border:3px solid transparent; font-family:var(--font-display); font-size:14px; color:var(--ink); transition:all .15s ease;`;
    if(creatorDraft.gender===val){ chip.style.background = 'var(--plum)'; chip.style.color = '#fff'; }
    chip.addEventListener('click', ()=>{
      creatorDraft.gender = val;
      genderRow.querySelectorAll('.option-chip').forEach(c=>{ c.style.background='#F1F3F9'; c.style.color='var(--ink)'; });
      chip.style.background = 'var(--plum)';
      chip.style.color = '#fff';
    });
    genderRow.appendChild(chip);
  });

  const avatarGrid = $('avatarGrid');
  avatarGrid.innerHTML = '';
  AVATAR_CHOICES.forEach((emoji, idx)=>{
    const el = document.createElement('button');
    el.className = 'avatar-choice' + (creatorDraft.avatarIndex===idx ? ' selected' : '');
    el.textContent = emoji;
    el.style.cssText = `aspect-ratio:1; border-radius:var(--radius-md); background:#F1F3F9; display:flex; align-items:center; justify-content:center; font-size:28px; border:3px solid transparent; transition:all .15s ease;`;
    if(creatorDraft.avatarIndex===idx){ el.style.borderColor='var(--gold)'; el.style.background='#FFF6DC'; }
    el.addEventListener('click', ()=>{
      creatorDraft.avatarIndex = idx;
      avatarGrid.querySelectorAll('.avatar-choice').forEach(c=>{ c.style.borderColor='transparent'; c.style.background='#F1F3F9'; });
      el.style.borderColor='var(--gold)';
      el.style.background='#FFF6DC';
    });
    avatarGrid.appendChild(el);
  });

  const colorGrid = $('colorGrid');
  colorGrid.innerHTML = '';
  COLOR_CHOICES.forEach((hex, idx)=>{
    const el = document.createElement('button');
    el.className = 'color-choice' + (creatorDraft.colorIndex===idx ? ' selected' : '');
    el.style.cssText = `width:36px; height:36px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 0 2px rgba(38,50,74,0.15); background:${hex};`;
    if(creatorDraft.colorIndex===idx) el.style.boxShadow = '0 0 0 3px var(--plum)';
    el.addEventListener('click', ()=>{
      creatorDraft.colorIndex = idx;
      colorGrid.querySelectorAll('.color-choice').forEach(c=>{ c.style.boxShadow='0 0 0 2px rgba(38,50,74,0.15)'; });
      el.style.boxShadow = '0 0 0 3px var(--plum)';
    });
    colorGrid.appendChild(el);
  });

  setHUDVisible(false);
  showScreen('screen-creator');
}

$('btnCreateConfirm').addEventListener('click', ()=>{
  const name = $('inputName').value.trim();
  if(!name){ toast('Choisis un prénom ✏️'); return; }
  if(!creatorDraft.schoolLevel){ toast('Choisis ta classe 🏫'); return; }
  const isNew = !state.created || startingFreshGame;
  if(isNew){
    const fresh = defaultState();
    Object.assign(fresh, { created:true, name, gender:creatorDraft.gender, avatarIndex:creatorDraft.avatarIndex, colorIndex:creatorDraft.colorIndex, schoolLevel:creatorDraft.schoolLevel, parentPin:state.parentPin });
    state = fresh;
  } else {
    state.name = name;
    state.gender = creatorDraft.gender;
    state.avatarIndex = creatorDraft.avatarIndex;
    state.colorIndex = creatorDraft.colorIndex;
    state.schoolLevel = creatorDraft.schoolLevel;
  }
  state.created = true;
  startingFreshGame = false;
  save();
  toast(`Bienvenue, ${name} ! 🎉`);
  renderMap();
});

// ============================================================
// 15. MAP
// ============================================================
function renderMap(){
  refreshHUD();
  setHUDVisible(true);
  $('hudBackBtn').classList.add('hidden');
  const schoolName = state.schoolLevel && SCHOOL_LEVELS[state.schoolLevel] ? SCHOOL_LEVELS[state.schoolLevel].name : '?';
  $('mapGreeting').textContent = `Salut ${state.name} (${schoolName}) !`;

  const grid = $('zoneGrid');
  grid.innerHTML = '';

  Object.values(SUBJECTS).forEach(sub=>{
    const unlocked = !!state.zonesUnlocked[sub.key];
    const needLevel = ZONE_UNLOCK_LEVEL[sub.key];
    const card = document.createElement('button');
    card.className = 'zone-card' + (unlocked ? '' : ' locked');
    const st = state.stats.bySubject[sub.key];
    const progressPct = st.asked>0 ? Math.min(100, Math.round((st.correct / Math.max(20,st.asked)) * 100)) : 0;
    card.innerHTML = `
      ${unlocked ? '' : '<div class="zone-lock">🔒</div>'}
      <div class="zone-icon">${sub.icon}</div>
      <div class="zone-name">${sub.name}</div>
      ${unlocked ? `
        <div class="zone-progress"><div class="zone-progress-fill" style="width:${progressPct}%; background:${sub.color};"></div></div>
        <div class="zone-unlock-hint">${st.correct} bonnes réponses</div>
      ` : `<div class="zone-unlock-hint">Niveau ${needLevel} requis</div>`}
    `;
    card.addEventListener('click', ()=>{
      if(!unlocked){ toast(`🔒 Débloque cette zone au niveau ${needLevel} !`); return; }
      if(!state.schoolLevel){ toast('Choisis ta classe ! 🏫'); renderCreator(); return; }
      openSubjectIntro(sub.key);
    });
    grid.appendChild(card);
  });

  const extraButtons = [
    { id:'house', icon:'🏠', name:'Maison du joueur', desc:'Personnalise ta maison', action:()=>openShop() },
    { id:'badges', icon:'🎖️', name:'Mes badges', desc:`${state.badges.length}/${BADGES.length} obtenus`, action:()=>openBadges() },
    { id:'revision', icon:'📚', name:'Zone de révision', desc:'Revois tes erreurs', action:()=>openRevision() },
    { id:'treasure', icon:'🏴‍☠️', name:'Chasse au trésor', desc:'Trouve les trésors !', action:()=>openTreasure() },
  ];

  extraButtons.forEach(btn => {
    const card = document.createElement('button');
    card.className = 'zone-card full-width';
    card.innerHTML = `
      <div class="zone-icon">${btn.icon}</div>
      <div style="display:flex; flex-direction:column; align-items:flex-start;">
        <div class="zone-name">${btn.name}</div>
        <div class="zone-unlock-hint">${btn.desc}</div>
      </div>
    `;
    card.addEventListener('click', btn.action);
    grid.appendChild(card);
  });

  showScreen('screen-map');
}
$('hudBackBtn').addEventListener('click', ()=>{ renderMap(); });

function unlockZonesForLevel(){
  let newly = [];
  Object.entries(ZONE_UNLOCK_LEVEL).forEach(([key, lvl])=>{
    if(state.level >= lvl && !state.zonesUnlocked[key]){
      state.zonesUnlocked[key] = true;
      newly.push(key);
    }
  });
  return newly;
}

// ============================================================
// 16. SUBJECT INTRO
// ============================================================
let currentSubjectKey = null;

function openSubjectIntro(subjectKey){
  currentSubjectKey = subjectKey;
  const sub = SUBJECTS[subjectKey];
  $('subjectIcon').textContent = sub.icon;
  $('subjectName').textContent = sub.name;
  $('subjectDesc').textContent = sub.desc;
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  showScreen('screen-subject-intro');
}
$('btnStartQuiz').addEventListener('click', ()=>{ startQuiz(currentSubjectKey); });

// ============================================================
// 17. BANQUES DE QUESTIONS MATHS (AVEC ÉTAPES ET RÈGLES CLAIRES)
// ============================================================
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

function makeChoices(correct, variants){
  const set = new Set([correct]);
  for(const v of variants){ if(set.size>=4) break; if(!set.has(v)) set.add(v); }
  while(set.size<4){ 
    const fallback = typeof correct === 'number' ? correct + randInt(-5,5) : `${correct}x`; 
    if(!set.has(fallback) && fallback!==0) set.add(fallback); 
  }
  return shuffle(Array.from(set));
}

function buildMathSession(schoolLevel, count){
  const out = [];
  
  for(let i=0; i<count; i++){
    let q, correct, choices, explain, steps = [], rule = '';
    
    switch(schoolLevel) {
      case 'cp': {
        const a = randInt(1, 10), b = randInt(1, 10);
        correct = a + b;
        q = `Combien font ${a} + ${b} ?`;
        choices = makeChoices(correct, [correct-1, correct+1, correct+2]).map(String);
        explain = `La somme de ${a} et ${b} donne ${correct}.`;
        steps = [`On part de ${a}`, `On ajoute ${b} unités`, `Résultat final : ${correct}`];
        rule = "L'addition sert à réunir deux ensembles.";
        break;
      }
      case 'ce1': {
        const a = randInt(2, 9), b = randInt(2, 9);
        correct = a * b;
        q = `Combien font ${a} × ${b} ?`;
        choices = makeChoices(correct, [correct-a, correct+b, correct+2]).map(String);
        explain = `${a} répété ${b} fois donne ${correct}.`;
        steps = [`On pose la multiplication : ${a} × ${b}`, `On additionne ${a}, ${b} fois de suite`, `Résultat : ${correct}`];
        rule = "La multiplication permet d'effectuer rapidement des additions répétées.";
        break;
      }
      case 'ce2': {
        const b = randInt(2, 10), ans = randInt(2, 10);
        const a = b * ans;
        correct = ans;
        q = `Combien font ${a} ÷ ${b} ?`;
        choices = makeChoices(correct, [correct-1, correct+1, correct+2]).map(String);
        explain = `On cherche combien de fois ${b} rentre dans ${a}.`;
        steps = [`Nombre de départ : ${a}`, `Diviseur : ${b}`, `Puisque ${b} × ${ans} = ${a}, le résultat est ${ans}`];
        rule = "La division permet d'effectuer un partage équitable.";
        break;
      }
      case 'cm1': {
        const num = randInt(1, 5), denom = randInt(6, 12);
        q = `Quelle est la moitié de ${num*2}/${denom} ?`;
        correct = `${num}/${denom}`;
        choices = makeChoices(correct, [`${num+1}/${denom}`, `${num}/${denom*2}`, `${num*2}/${denom}`]);
        explain = `Diviser par 2 le numérateur conserve le même dénominateur.`;
        steps = [`Fraction initiale : ${num*2}/${denom}`, `On divise le numérateur par 2 : (${num*2} ÷ 2) = ${num}`, `Résultat : ${num}/${denom}`];
        rule = "Pour calculer la moitié d'une fraction, on prend la moitié de son numérateur.";
        break;
      }
      case 'cm2': {
        const p = randInt(2, 9) * 10;
        const total = randInt(1, 5) * 100;
        correct = (p * total) / 100;
        q = `Combien font ${p}% de ${total} ?`;
        choices = makeChoices(correct, [correct-10, correct+10, correct*2]).map(String);
        explain = `Multiplier par ${p} puis diviser par 100.`;
        steps = [`Étape 1 : Multiplier ${total} par ${p} = ${total * p}`, `Étape 2 : Diviser par 100 → (${total * p}) ÷ 100`, `Résultat : ${correct}`];
        rule = "Calculer x% d'un nombre revient à multiplier par x puis diviser par 100.";
        break;
      }
      case '6e': {
        const a = randInt(2, 15);
        correct = a * a;
        q = `Quel est l'aire d'un carré de côté ${a} cm ?`;
        choices = makeChoices(correct, [a*4, correct-5, correct+10]).map(v => `${v} cm²`);
        correct = `${correct} cm²`;
        explain = `L'aire s'obtient en multipliant le côté par lui-même.`;
        steps = [`Formule : Aire = Côté × Côté`, `Calcul : ${a} cm × ${a} cm`, `Résultat : ${a*a} cm²`];
        rule = "L'aire d'un carré se calcule en élevant la longueur de son côté au carré.";
        break;
      }
      case '5e': {
        const x = randInt(2, 8), b = randInt(1, 10);
        const res = x + b;
        q = `Résous l'équation : x + ${b} = ${res}`;
        correct = String(x);
        choices = makeChoices(correct, [String(x+1), String(x-1), String(res)]);
        explain = `On isole x en soustrayant ${b} de chaque côté.`;
        steps = [`Équation : x + ${b} = ${res}`, `Soustraction : x = ${res} - ${b}`, `Résultat : x = ${x}`];
        rule = "Dans une équation, toute opération effectuée d'un côté de l'égalité doit être effectuée de l'autre.";
        break;
      }
      case '4e': {
        const triples = [[3,4,5], [6,8,10], [5,12,13], [9,12,15]];
        const t = triples[randInt(0, triples.length-1)];
        q = `Dans un triangle rectangle, les côtés de l'angle droit mesurent ${t[0]} cm et ${t[1]} cm. Combien mesure l'hypoténuse ?`;
        correct = `${t[2]} cm`;
        choices = makeChoices(correct, [`${t[0]+t[1]} cm`, `${t[2]+2} cm`, `${t[2]-1} cm`]);
        explain = `D'après le théorème de Pythagore, BC² = AB² + AC².`;
        steps = [
          `Calcul des carrés : ${t[0]}² = ${t[0]*t[0]} et ${t[1]}² = ${t[1]*t[1]}`,
          `Somme des carrés : ${t[0]*t[0]} + ${t[1]*t[1]} = ${t[2]*t[2]}`,
          `Racine carrée : √${t[2]*t[2]} = ${t[2]} cm`
        ];
        rule = "Théorème de Pythagore : Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.";
        break;
      }
      case '3e': {
        const type = randInt(1, 3);
        if(type === 1) {
          const a = randInt(2, 5), b = randInt(1, 9);
          const x = randInt(1, 5);
          const res = a * x + b;
          q = `Soit la fonction affine f(x) = ${a}x + ${b}. Calcule f(${x}).`;
          correct = String(res);
          choices = makeChoices(correct, [String(res+a), String(res-b), String(a+b+x)]);
          explain = `Remplacer la variable x par la valeur ${x}.`;
          steps = [
            `Formule : f(x) = ${a}x + ${b}`,
            `Remplacement de x : f(${x}) = ${a} × ${x} + ${b}`,
            `Calcul : ${a*x} + ${b} = ${res}`
          ];
          rule = "L'image d'un nombre par une fonction s'obtient en remplaçant x par ce nombre dans la formule.";
        } else if(type === 2) {
          const a = randInt(2, 6);
          q = `Développe et réduis l'expression : (x + ${a})²`;
          correct = `x² + ${2*a}x + ${a*a}`;
          choices = makeChoices(correct, [`x² + ${a*a}`, `x² + ${a}x + ${a*a}`, `2x + ${2*a}`]);
          explain = `Appliquer la première identité remarquable (a + b)².`;
          steps = [
            `Identité : (a + b)² = a² + 2ab + b²`,
            `Ici a = x et b = ${a}`,
            `Développement : x² + (2 × x × ${a}) + ${a}² = x² + ${2*a}x + ${a*a}`
          ];
          rule = "Identité remarquable : (a + b)² = a² + 2ab + b².";
        } else {
          const a = randInt(2, 4), b = randInt(1, 10);
          const x = randInt(2, 6);
          const target = a * x - b;
          q = `Résous l'équation : ${a}x - ${b} = ${target}`;
          correct = `x = ${x}`;
          choices = makeChoices(correct, [`x = ${x+1}`, `x = ${x-1}`, `x = ${target}`]);
          explain = `Isoler le terme en x puis diviser par son coefficient.`;
          steps = [
            `Équation initiale : ${a}x - ${b} = ${target}`,
            `Passer -${b} à droite : ${a}x = ${target} + ${b} = ${target+b}`,
            `Diviser par ${a} : x = ${target+b} ÷ ${a} = ${x}`
          ];
          rule = "Pour résoudre ax - b = c, on ajoute b de chaque côté puis on divise par a.";
        }
        break;
      }
      default: {
        const a = randInt(1, 5), b = randInt(1, 5);
        correct = a + b;
        q = `Combien font ${a} + ${b} ?`;
        choices = makeChoices(correct, [correct-1, correct+1, correct+2]).map(String);
        explain = `${a} + ${b} = ${correct}`;
        steps = [`Addition de ${a} et ${b}`, `Résultat : ${correct}`];
        rule = "L'addition permet de combiner deux nombres.";
      }
    }
    
    out.push({
      question: q,
      choices: choices,
      correctIndex: choices.indexOf(String(correct)),
      explain: explain,
      steps: steps,
      rule: rule
    });
  }
  return out;
}

const FRENCH_BANK = [
  { q: "Quelle est la première lettre de « chat » ?", choices: ["c", "h", "a", "t"], correctIndex: 0, steps: ["Observation du mot « chat »", "La lettre du début est 'c'"], rule: "L'alphabet commence par 'a', 'b', 'c'..." },
  { q: "« Le chat dort sur le canapé. » Que fait le chat ?", choices: ["Il mange", "Il dort", "Il court", "Il joue"], correctIndex: 1, steps: ["Repérer le verbe d'action : 'dort'", "Action identifiée : Il dort"], rule: "Le verbe indique ce que fait le sujet." },
  { q: "Quel est le synonyme de « content » ?", choices: ["Triste", "Heureux", "Fatigué", "Fâché"], correctIndex: 1, steps: ["Définition de 'content' : ressentir de la joie", "Chercher le mot avec le même sens : 'heureux'"], rule: "Des synonymes sont des mots qui ont le même sens." },
  { q: "Quel est le contraire de « chaud » ?", choices: ["Tiède", "Brûlant", "Froid", "Sec"], correctIndex: 2, steps: ["Sens opposé à une température élevée", "Sens inverse : 'froid'"], rule: "Un antonyme est un mot de sens contraire." },
  { q: "Quel est le pluriel de « cheval » ?", choices: ["Chevals", "Chevaux", "Chevales", "Chevaus"], correctIndex: 1, steps: ["Mot se terminant par '-al'", "Règle générale : '-al' devient '-aux'"], rule: "Les noms en -al font leur pluriel en -aux (sauf exceptions)." },
  { q: "Quel est le féminin de « acteur » ?", choices: ["Acteure", "Actrice", "Actriste", "Actoresse"], correctIndex: 1, steps: ["Nom masculin en '-teur'", "Transformation au féminin : '-teur' devient '-trice'"], rule: "La plupart des noms masculins en -teur deviennent -trice au féminin." }
];

const ENGLISH_BANK = [
  { q: "« Apple » means...", choices: ["Pomme", "Maison", "Chien", "Livre"], correctIndex: 0, steps: ["Vocabulary check: 'Apple'", "Traduction française : 'Pomme'"], rule: "Vocabulaire des fruits en anglais." },
  { q: "« Dog » means...", choices: ["Chat", "Oiseau", "Chien", "Poisson"], correctIndex: 2, steps: ["Vocabulary check: 'Dog'", "Traduction française : 'Chien'"], rule: "Vocabulaire des animaux domestiques." },
  { q: "« Cat » means...", choices: ["Chat", "Chien", "Souris", "Lapin"], correctIndex: 0, steps: ["Vocabulary check: 'Cat'", "Traduction française : 'Chat'"], rule: "Vocabulaire des animaux domestiques." }
];

const SCIENCE_BANK = [
  { q: "Quel animal vit dans l'eau ?", choices: ["Le lapin", "Le poisson", "Le chat", "Le chien"], correctIndex: 1, steps: ["Analyse de l'habitat aquatique", "Le poisson possède des ouïes pour respirer sous l'eau"], rule: "Les animaux aquatiques sont adaptés à la vie dans l'eau." },
  { q: "Que donne la vache ?", choices: ["Du lait", "Des œufs", "Du miel", "De la laine"], correctIndex: 0, steps: ["Mammifère producteur de lait", "La vache produit du lait pour son veau"], rule: "Les femelles mammifères produisent du lait." },
  { q: "Combien d'os a un adulte humain ?", choices: ["206", "106", "306", "406"], correctIndex: 0, steps: ["Anatomie humaine", "Le squelette adulte comprend exactement 206 os"], rule: "Le squelette humain soutient le corps." }
];

function buildBankSession(bank, count){
  const picked = pickN(bank, count);
  return picked.map(item => {
    const shuffled = shuffle(item.choices);
    const correctText = item.choices[item.correctIndex];
    return {
      question: item.q,
      choices: shuffled,
      correctIndex: shuffled.indexOf(correctText),
      explain: `La bonne réponse est : ${correctText}`,
      steps: item.steps || [`Question : ${item.q}`, `Bonne réponse : ${correctText}`],
      rule: item.rule || ''
    };
  });
}

function buildSessionForSubject(subjectKey, schoolLevel){
  const COUNT = 8;
  if(!schoolLevel || !SCHOOL_LEVELS[schoolLevel]) schoolLevel = 'cp';
  if(subjectKey === 'math') return buildMathSession(schoolLevel, COUNT);
  if(subjectKey === 'francais') return buildBankSession(FRENCH_BANK, COUNT);
  if(subjectKey === 'anglais') return buildBankSession(ENGLISH_BANK, COUNT);
  if(subjectKey === 'sciences') return buildBankSession(SCIENCE_BANK, COUNT);
  if(subjectKey === 'enigmes') {
    const parts = [
      ...buildMathSession(schoolLevel, 2),
      ...buildBankSession(FRENCH_BANK, 2),
      ...buildBankSession(ENGLISH_BANK, 2),
      ...buildBankSession(SCIENCE_BANK, 2),
    ];
    return shuffle(parts);
  }
  return buildBankSession(FRENCH_BANK, COUNT);
}

// ============================================================
// 18. QUIZ ENGINE
// ============================================================
let quizSession = null;
let quizQuestions = [];

function startQuiz(subjectKey){
  if(!state.schoolLevel){ toast('Choisis ta classe ! 🏫'); renderCreator(); return; }
  quizQuestions = buildSessionForSubject(subjectKey, state.schoolLevel);
  quizSession = {
    subjectKey,
    questions: quizQuestions,
    index: 0,
    correctCount: 0,
    streak: 0,
    earnedXp: 0,
    earnedCoins: 0,
    answered: false
  };
  rikoSay(getRikoMessage('welcome'), '🦊', 'idle');
  refreshHUD();
  renderQuizQuestion();
  showScreen('screen-quiz');
}

function renderQuizQuestion(){
  const s = quizSession;
  if(!s || s.index >= s.questions.length) return;
  const q = s.questions[s.index];
  $('quizProgressLabel').textContent = `Question ${s.index+1}/${s.questions.length}`;
  $('quizStreakLabel').textContent = `🔥 x${s.streak}`;
  $('quizQuestion').textContent = q.question;
  $('quizFeedback').className = 'quiz-feedback';
  $('quizFeedback').textContent = '';$('quizExplanation').className = 'quiz-explanation';
  $('quizExplanation').textContent = '';$('quizNextWrap').classList.add('hidden');
  s.answered = false;
  $('btnQuizExplain').classList.add('hidden');
  $('btnQuizRetry').classList.add('hidden');$('quizActions').classList.add('hidden');

  const choicesEl = $('quizChoices');
  choicesEl.innerHTML = '';
  q.choices.forEach((choiceText, idx)=>{
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choiceText;
    btn.addEventListener('click', ()=> selectChoice(idx, btn));
    choicesEl.appendChild(btn);
  });
}

function selectChoice(idx, btnEl){
  const s = quizSession;
  if(s.answered) return;
  s.answered = true;
  const q = s.questions[s.index];
  const isCorrect = idx === q.correctIndex;
  const allBtns = Array.from($('quizChoices').children);

  allBtns.forEach((b,i)=>{
    if(i===q.correctIndex) b.classList.add('correct');
    else if(i===idx && !isCorrect) b.classList.add('wrong');
    else b.classList.add('dim');
  });

  if(!q._askCounted){
    q._askCounted = true;
    state.stats.questionsAnswered++;
    state.stats.bySubject[s.subjectKey].asked++;
  }

  const feedback = $('quizFeedback');
  feedback.classList.add('show');

  if(isCorrect){
    s.correctCount++;
    s.streak++;
    if(!q._correctCounted){
      q._correctCounted = true;
      state.stats.correctAnswers++;
      state.stats.bySubject[s.subjectKey].correct++;
    }
    if(s.streak > state.stats.bestStreak) state.stats.bestStreak = s.streak;
    const xpGain = 20 + Math.min(10, s.streak*2);
    const coinGain = 5;
    s.earnedXp += xpGain;
    s.earnedCoins += coinGain;
    state.xp += xpGain;
    state.coins += coinGain;
    feedback.className = 'quiz-feedback show ok';
    feedback.textContent = `✅ Bonne réponse ! (+${xpGain} XP)`;
    if(s.streak >= 3) rikoSay(`🔥 ${s.streak} d'affilée !`, '🔥', 'happy');
    else rikoCorrect();
    maybeLevelUp();
    updateDailyProgress(s.subjectKey);
    const wrongIdx = state.stats.wrongQuestions.findIndex(w => w.question === q.question);
    if(wrongIdx >= 0) state.stats.wrongQuestions.splice(wrongIdx, 1);
  } else {
    s.streak = 0;
    feedback.className = 'quiz-feedback show ko';
    feedback.textContent = `❌ Pas tout à fait.`;
    rikoWrong();
    if(!state.stats.wrongQuestions.some(w => w.question === q.question)){
      state.stats.wrongQuestions.push({ question: q.question, correctAnswer: q.choices[q.correctIndex] });
      if(state.stats.wrongQuestions.length > 50) state.stats.wrongQuestions.shift();
    }
    $('quizActions').classList.remove('hidden');
    $('btnQuizExplain').classList.remove('hidden');$('btnQuizExplain').textContent = '💡 Expliquer';
    $('btnQuizExplain').onclick = () => showExplanation(q);
    $('btnQuizRetry').classList.remove('hidden');$('btnQuizRetry').textContent = '🔄 Réessayer';
    $('btnQuizRetry').onclick = () => {
      const savedIndex = s.index;
      s.index = savedIndex;
      s.answered = false;
      renderQuizQuestion();
      rikoSay("On réessaie ! 💪", '🦊', 'motivated');
    };
  }

  refreshHUD();
  save();
  $('quizNextWrap').classList.remove('hidden');$('quizStreakLabel').textContent = `🔥 x${s.streak}`;
}

// AFFICHAGE EXPLICATIF CORRIGÉ AVEC LISTE ET ÉTAPES
function showExplanation(q) {
  const explanationEl = $('quizExplanation');
  let html = '';
  
  if(q.rule) {
    html += `<div style="background:var(--card); border-radius:var(--radius-sm); padding:10px 12px; margin-bottom:10px; border:2px solid var(--gold); color:var(--ink);"><strong>📖 Règle de cours :</strong><br>${q.rule}</div>`;
  }
  
  if(q.steps && q.steps.length){
    html += `<div style="margin-bottom:8px;"><strong>🧩 Étapes pour résoudre :</strong></div><ul style="margin:0; padding-left:20px; line-height:1.6;">`;
    q.steps.forEach((step) => { 
      html += `<li style="margin-bottom:4px;">${step}</li>`; 
    });
    html += `</ul>`;
  } else if(q.explain) {
    html += `<div style="margin-top:6px;"><strong>💡 Explication :</strong> ${q.explain}</div>`;
  }
  
  explanationEl.innerHTML = html;
  explanationEl.style.display = 'block';
  explanationEl.classList.add('show');
  rikoExplain();
}

function maybeLevelUp(){
  let leveledUp = false;
  while(state.xp >= xpNeededForLevel(state.level)){
    state.xp -= xpNeededForLevel(state.level);
    state.level++;
    const coinReward = state.level * 10;
    state.coins += coinReward;
    leveledUp = true;
    SoundManager.play('levelup');
  }
  if(leveledUp){
    rikoSay(getRikoMessage('levelUp'), '🎉', 'celebrate');
    unlockZonesForLevel();
  }
}

$('btnQuizNext').addEventListener('click', ()=>{
  const s = quizSession;
  if(!s) return;
  s.index++;
  if(s.index >= s.questions.length){
    endQuiz();
  } else {
    renderQuizQuestion();
    const msgs = ["Prêt pour la suite ? 💪", "On continue ? 🚀", "Encore une question ! 🔥"];
    rikoSay(msgs[Math.floor(Math.random() * msgs.length)], '🦊', 'idle');
  }
});

function endQuiz(){
  const s = quizSession;
  if(!s) return;
  if(s.correctCount === s.questions.length) state.stats.perfectQuizzes++;
  window.__lastNewBadges = checkBadges();
  save();
  renderReward();
}

// ============================================================
// 19. DAILY CHALLENGES
// ============================================================
function updateDailyProgress(subjectKey){
  const today = new Date().toDateString();
  if(state.dailyChallenges.date !== today){
    state.dailyChallenges.date = today;
    state.dailyChallenges.progress = { math:0, francais:0, anglais:0, sciences:0 };
    state.dailyChallenges.completed = false;
    state.dailyChallenges.rewardClaimed = false;
  }
  if(state.dailyChallenges.progress[subjectKey] !== undefined){
    state.dailyChallenges.progress[subjectKey]++;
  }
  const allDone = Object.values(state.dailyChallenges.progress).every(v => v >= 3);
  if(allDone && !state.dailyChallenges.completed){
    state.dailyChallenges.completed = true;
    state.stats.dailyChallengesCompleted++;
    toast('🎉 Défis du jour terminés ! +20 coins bonus !');
    state.coins += 20;
    save();
  }
}

function renderDailyChallenges(){
  const today = new Date().toDateString();
  if(state.dailyChallenges.date !== today){
    state.dailyChallenges.date = today;
    state.dailyChallenges.progress = { math:0, francais:0, anglais:0, sciences:0 };
    state.dailyChallenges.completed = false;
    state.dailyChallenges.rewardClaimed = false;
    save();
  }

  const content = $('dailyContent');
  let html = `<div style="margin-bottom:12px; text-align:center; font-weight:700; opacity:.7;">📅 ${new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}</div>`;

  Object.entries(SUBJECTS).forEach(([key, sub]) => {
    if(key === 'enigmes') return;
    const progress = state.dailyChallenges.progress[key] || 0;
    const done = progress >= 3;
    html += `
      <div class="daily-challenge">
        <div class="dc-left">
          <div class="dc-icon">${sub.icon}</div>
          <div>
            <div class="dc-name">${sub.name}</div>
            <div class="dc-progress">${progress}/3 ${done ? '✅' : ''}</div>
          </div>
        </div>
        <div class="dc-reward">${done ? '✅' : '🎁 +5 XP'}</div>
      </div>
    `;
  });

  const allDone = Object.values(state.dailyChallenges.progress).every(v => v >= 3);
  if(allDone && !state.dailyChallenges.rewardClaimed){
    html += `
      <div style="background:var(--gold); border-radius:var(--radius-md); padding:14px; text-align:center; font-family:var(--font-display); font-weight:700; color:#5C3A00;">
        🎉 Tous les défis sont terminés ! Tu as gagné +20 coins bonus !
      </div>
    `;
    state.dailyChallenges.rewardClaimed = true;
    save();
  }

  content.innerHTML = html;
  setHUDVisible(false);
  showScreen('screen-daily');
}

$('btnDailyChallenge').addEventListener('click', renderDailyChallenges);$('btnDailyBack').addEventListener('click', ()=>{
  if(state.created) renderMap();
  else renderHome();
});

// ============================================================
// 20. REVISION
// ============================================================
function openRevision(){
  const list = $('revisionList');
  const wrong = state.stats.wrongQuestions;
  if(wrong.length === 0){
    list.innerHTML = `
      <div style="text-align:center; padding:40px 20px; background:var(--card); border-radius:var(--radius-lg); box-shadow:var(--shadow-hard);">
        <div style="font-size:48px; margin-bottom:12px;">🌟</div>
        <h3 style="font-family:var(--font-display); color:var(--plum-dark);">Aucune erreur enregistrée</h3>
        <p style="font-weight:600; opacity:.6;">Continue comme ça, tu es sur la bonne voie !</p>
      </div>
    `;
  } else {
    list.innerHTML = wrong.map((w, i) => `
      <div class="revision-item">
        <div>
          <div class="ri-question">${i+1}. ${w.question}</div>
          <div class="ri-answer">✅ ${w.correctAnswer}</div>
        </div>
      </div>
    `).join('');
  }
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  showScreen('screen-revision');
}

$('btnRevisionBack').addEventListener('click', ()=>{ renderMap(); });

// ============================================================
// 21. TREASURE HUNT
// ============================================================
let treasureState = { currentQuestion: null, answered: false };

function openTreasure(){
  treasureState.currentQuestion = null;
  treasureState.answered = false;
  renderTreasure();
}

function renderTreasure(){
  const content = $('treasureContent');
  let gridHtml = '<div class="treasure-grid">';
  for(let i=0; i<16; i++){
    const found = state.treasureFound.includes(i);
    gridHtml += `
      <div class="treasure-cell ${found ? 'found' : ''}" data-index="${i}" onclick="treasureClick(${i})">
        ${found ? '🪙' : '❓'}
      </div>
    `;
  }
  gridHtml += '</div>';
  gridHtml += `<div style="text-align:center; margin-top:12px; font-weight:700;">🪙 ${state.treasureFound.length}/16 trésors trouvés</div>`;

  if(treasureState.currentQuestion){
    const q = treasureState.currentQuestion;
    gridHtml += `
      <div style="background:var(--card); border-radius:var(--radius-lg); padding:16px; margin-top:12px; box-shadow:var(--shadow-hard);">
        <div style="font-family:var(--font-display); font-size:18px; margin-bottom:12px;">${q.question}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          ${q.choices.map((c, i) => `
            <button onclick="treasureAnswer(${i})" style="background:#F1F3F9; border:none; border-radius:var(--radius-md); padding:12px; font-family:var(--font-body); font-weight:700; font-size:15px; cursor:pointer;">${c}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  content.innerHTML = gridHtml;
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  showScreen('screen-treasure');
}

function treasureClick(index){
  if(state.treasureFound.includes(index)){
    toast('🏆 Trésor déjà trouvé !');
    return;
  }
  if(treasureState.currentQuestion){
    toast('Réponds d\'abord à la question !');
    return;
  }
  const bank = [...FRENCH_BANK, ...ENGLISH_BANK, ...SCIENCE_BANK];
  const q = pickN(bank, 1)[0];
  const shuffled = shuffle(q.choices);
  const correctText = q.choices[q.correctIndex];
  treasureState.currentQuestion = {
    question: q.q,
    choices: shuffled,
    correctIndex: shuffled.indexOf(correctText),
    cellIndex: index
  };
  treasureState.answered = false;
  renderTreasure();
}

function treasureAnswer(idx){
  if(treasureState.answered) return;
  treasureState.answered = true;
  const q = treasureState.currentQuestion;
  const isCorrect = idx === q.correctIndex;
  if(isCorrect){
    state.treasureFound.push(q.cellIndex);
    state.stats.treasuresFound = state.treasureFound.length;
    SoundManager.play('treasure');
    toast('🎉 Trésor trouvé ! +10 XP !');
    state.xp += 10;
    save();
    if(state.treasureFound.length === 16){
      toast('🏴‍☠️ Tous les trésors sont trouvés ! Tu es un véritable chasseur de trésors !');
    }
    refreshHUD();
  } else {
    toast('❌ Mauvaise réponse, réessaye !');
  }
  treasureState.currentQuestion = null;
  setTimeout(renderTreasure, 800);
}

window.treasureClick = treasureClick;
window.treasureAnswer = treasureAnswer;

$('btnTreasureBack').addEventListener('click', ()=>{ renderMap(); });

// ============================================================
// 22. REWARD
// ============================================================
function checkBadges(){
  const newly = [];
  BADGES.forEach(b=>{
    if(!state.badges.includes(b.id) && b.check(state)){
      state.badges.push(b.id);
      newly.push(b);
    }
  });
  return newly;
}

function renderReward(){
  const s = quizSession;
  if(!s) return;
  const sub = SUBJECTS[s.subjectKey];
  const pct = Math.round((s.correctCount / s.questions.length) * 100);

  $('rewardBurstIcon').textContent = '🏆';
  $('rewardTitle').textContent = pct >= 80 ? '🌟 Excellent !' : '👍 Bien joué !';
  $('rewardSubtitle').textContent = `${sub.name} — ${s.correctCount}/${s.questions.length} (${pct}%)`;

  const statsRow = $('rewardStatsRow');
  statsRow.innerHTML = `
    <div class="hud-pill"><span class="ico">⚡</span>+${s.earnedXp} XP</div>
    <div class="hud-pill"><span class="ico">🪙</span>+${s.earnedCoins}</div>
  `;

  const badgeArea = $('rewardBadgeArea');
  badgeArea.innerHTML = '';
  if(window.__lastNewBadges && window.__lastNewBadges.length){
    window.__lastNewBadges.forEach(b=>{
      const el = document.createElement('div');
      el.className = 'badge-popup';
      el.style.cssText = 'background:var(--card); border-radius:var(--radius-md); padding:10px 16px; display:flex; align-items:center; gap:8px; box-shadow:var(--shadow-soft); font-family:var(--font-display); font-weight:700; color:var(--plum-dark); margin-top:6px;';
      el.innerHTML = `<span style="font-size:24px;">${b.icon}</span><span>Nouveau badge : ${b.name} !</span>`;
      badgeArea.appendChild(el);
    });
  }

  if(pct >= 80) rikoSay(getRikoMessage('endGood'), '🏆', 'proud');
  else if(pct >= 50) rikoSay(getRikoMessage('endOk'), '💪', 'motivated');
  else rikoSay(getRikoMessage('endWeak'), '❤️', 'sad');

  refreshHUD();
  showScreen('screen-reward');
}

$('btnRewardContinue').addEventListener('click', ()=>{ renderMap(); });

// ============================================================
// 23. SHOP / HOUSE
// ============================================================
function openShop(){
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  switchShopTab('house');
  showScreen('screen-shop');
}

function switchShopTab(tab){
  $('tabHouse').classList.toggle('active', tab==='house');$('tabShop').classList.toggle('active', tab==='shop');
  $('houseView').classList.toggle('hidden', tab!=='house');$('shopView').classList.toggle('hidden', tab!=='shop');
  if(tab==='house') renderHouseView();
  else renderShopView();
}
$('tabHouse').addEventListener('click', ()=> switchShopTab('house'));$('tabShop').addEventListener('click', ()=> switchShopTab('shop'));

function renderHouseView(){
  const el = $('houseView');
  const hat = equippedHatEmoji();
  const petItem = SHOP_ITEMS.find(i=>i.id===state.house.pet);
  const decoItems = state.house.decorations.map(id=>SHOP_ITEMS.find(i=>i.id===id)).filter(Boolean);

  el.innerHTML = `
    <div class="house-scene">
      <div class="house-avatar-wrap">
        <svg width="100" height="100" viewBox="0 0 200 200">${avatarSVG(currentAvatarColor(), currentAvatarEmoji(), 200)}</svg>
        ${hat ? `<div style="position:absolute; top:16px; left:50%; transform:translateX(-50%); font-size:24px;">${hat}</div>` : ''}
      </div>
      ${petItem ? `<div class="house-pet">${petItem.icon}</div>` : ''}
      <div class="house-furniture">${decoItems.map(d=>`<span>${d.icon}</span>`).join('')}</div>
      <div class="house-floor"></div>
    </div>
    <div class="section-title" style="font-family:var(--font-display); font-weight:700; font-size:15px; color:var(--plum-dark); margin:14px 0 8px;">Objets possédés</div>
    <div class="shop-grid" id="ownedGrid"></div>
  `;

  const ownedGrid = $('ownedGrid');
  const owned = SHOP_ITEMS.filter(i => state.shopOwned.includes(i.id));
  if(owned.length===0){
    ownedGrid.innerHTML = `<p style="grid-column:1/-1; text-align:center; font-weight:700; opacity:.6; font-size:13px;">Va à la boutique pour acheter tes premiers objets ! 🛍️</p>`;
    return;
  }
  owned.forEach(item=>{
    const isEquipped = isItemEquipped(item);
    const card = document.createElement('div');
    card.className = 'shop-item' + (isEquipped ? ' owned' : '');
    card.innerHTML = `
      <div class="s-ico">${item.icon}</div>
      <div class="s-name">${item.name}</div>
      <button class="shop-buy-btn ${isEquipped ? 'equipped' : ''}">${isEquipped ? '✓ Équipé' : 'Équiper'}</button>
    `;
    card.querySelector('button').addEventListener('click', ()=>{ equipItem(item); renderHouseView(); });
    ownedGrid.appendChild(card);
  });
}

function isItemEquipped(item){
  if(item.cat==='pet') return state.house.pet === item.id;
  if(item.cat==='decoration') return state.house.decorations.includes(item.id);
  return state.shopEquipped[item.cat] === item.id;
}

function equipItem(item){
  if(item.cat==='pet'){
    state.house.pet = (state.house.pet===item.id) ? null : item.id;
  } else if(item.cat==='decoration'){
    const idx = state.house.decorations.indexOf(item.id);
    if(idx>=0) state.house.decorations.splice(idx,1);
    else { if(state.house.decorations.length>=3) state.house.decorations.shift(); state.house.decorations.push(item.id); }
  } else {
    state.shopEquipped[item.cat] = (state.shopEquipped[item.cat]===item.id) ? null : item.id;
  }
  save();
}

function renderShopView(){
  const el = $('shopView');
  el.innerHTML = `<div class="section-title" style="font-family:var(--font-display); font-weight:700; font-size:15px; color:var(--plum-dark); margin:0 0 10px;">🪙 Tu as ${state.coins} pièces</div><div class="shop-grid" id="shopGrid"></div>`;
  const grid = $('shopGrid');
  SHOP_ITEMS.forEach(item=>{
    const owned = state.shopOwned.includes(item.id);
    const card = document.createElement('div');
    card.className = 'shop-item' + (owned ? ' owned' : '');
    card.innerHTML = `
      <div class="s-ico">${item.icon}</div>
      <div class="s-name">${item.name}</div>
      <div class="s-price">🪙 ${item.price}</div>
      <button class="shop-buy-btn" ${owned ? 'disabled' : (state.coins<item.price ? 'disabled' : '')}>${owned ? '✓ Possédé' : 'Acheter'}</button>
    `;
    if(!owned){
      card.querySelector('button').addEventListener('click', ()=>{
        if(state.coins < item.price){ toast('Pas assez de pièces 🪙'); return; }
        state.coins -= item.price;
        state.shopOwned.push(item.id);
        save();
        refreshHUD();
        toast(`🎉 Tu as acheté : ${item.name} !`);
        renderShopView();
      });
    }
    grid.appendChild(card);
  });
}

// ============================================================
// 24. BADGES SCREEN
// ============================================================
function openBadges(){
  $('hudBackBtn').classList.remove('hidden');
  refreshHUD();
  const grid = $('badgesGrid');
  grid.innerHTML = '';
  BADGES.forEach(b=>{
    const earned = state.badges.includes(b.id);
    const card = document.createElement('div');
    card.className = 'badge-card' + (earned ? ' earned' : '');
    card.innerHTML = `<div class="b-ico">${b.icon}</div><div class="b-name">${b.name}</div>`;
    grid.appendChild(card);
  });
  showScreen('screen-badges');
}

// ============================================================
// 25. PARENT DASHBOARD
// ============================================================
function renderParentDashboard(){
  const s = state.stats;
  const successRate = s.questionsAnswered>0 ? Math.round((s.correctAnswers/s.questionsAnswered)*100) : 0;
  const content = $('parentDashboardContent');
  const schoolName = state.schoolLevel && SCHOOL_LEVELS[state.schoolLevel] ? SCHOOL_LEVELS[state.schoolLevel].name : 'Non défini';

  const subjectRows = Object.values(SUBJECTS).filter(sub=>sub.key!=='enigmes').map(sub=>{
    const st = s.bySubject[sub.key];
    const rate = st.asked>0 ? Math.round((st.correct/st.asked)*100) : 0;
    return `
      <div class="subject-bar-row">
        <div class="lbl"><span>${sub.icon} ${sub.name}</span><span>${st.correct}/${st.asked}</span></div>
        <div class="subject-bar"><div class="subject-bar-fill" style="width:${rate}%; background:${sub.color};"></div></div>
      </div>
    `;
  }).join('');

  content.innerHTML = `
    ${state.created ? `<div class="stat-card"><span class="label">Héros</span><span class="value">${state.name}</span></div>` : ''}
    <div class="stat-card"><span class="label">Classe scolaire</span><span class="value">🏫 ${schoolName}</span></div>
    <div class="stat-card"><span class="label">Niveau d'aventure</span><span class="value">⭐ ${state.level}</span></div>
    <div class="stat-card"><span class="label">XP total</span><span class="value">⚡ ${state.xp} / ${xpNeededForLevel(state.level)}</span></div>
    <div class="stat-card"><span class="label">Questions répondues</span><span class="value">${s.questionsAnswered}</span></div>
    <div class="stat-card"><span class="label">Taux de réussite</span><span class="value">${successRate}%</span></div>
    <div class="stat-card"><span class="label">Meilleure série</span><span class="value">🔥 ${s.bestStreak}</span></div>
    <div class="stat-card"><span class="label">Quiz parfaits</span><span class="value">💯 ${s.perfectQuizzes}</span></div>
    <div class="stat-card"><span class="label">Trésors trouvés</span><span class="value">🏴‍☠️ ${s.treasuresFound}/16</span></div>
    <div class="stat-card"><span class="label">Défis du jour</span><span class="value">📅 ${s.dailyChallengesCompleted}</span></div>
    <div class="stat-card"><span class="label">Badges obtenus</span><span class="value">🎖️ ${state.badges.length}/${BADGES.length}</span></div>
    <div class="section-title" style="font-family:var(--font-display); font-weight:700; font-size:15px; color:var(--plum-dark); margin:12px 0 8px;">Progression par matière</div>
    ${subjectRows}
    <div class="section-title" style="font-family:var(--font-display); font-weight:700; font-size:15px; color:var(--plum-dark); margin:12px 0 8px;">Confidentialité</div>
    <p style="font-weight:700; font-size:13px; opacity:.7; line-height:1.5;">
      Adventure School ne collecte aucune donnée personnelle réelle.<br>
      Toutes les informations sont stockées localement sur cet appareil (localStorage).
    </p>
  `;
  setHUDVisible(false);
  showScreen('screen-parent-dashboard');
}

$('btnParentExit').addEventListener('click', ()=>{
  if(state.created) renderMap();
  else renderHome();
});

// ============================================================
// CONTROLE MUSIQUE
// ============================================================
const MusicManager = {
  ctx: null,
  gainNode: null,
  isMuted: false,
  volume: 0.3,
  isPlaying: false,
  timeoutId: null,
  melody: [523, 587, 659, 587, 523, 494, 523, 587, 659, 784, 659, 587, 523, 494, 440, 494],
  noteIndex: 0,
  
  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume * 0.08;
      this.gainNode.connect(this.ctx.destination);
      this.loadPrefs();
      this.updateUI();
    } catch(e) {
      console.warn('Audio non disponible', e);
    }
  },
  
  start() {
    if (this.isMuted || !this.ctx) return;
    if (this.isPlaying) this.stop();
    this.isPlaying = true;
    this.noteIndex = 0;
    this.scheduleNote(0);
  },
  
  scheduleNote(time) {
    if (!this.isPlaying || this.isMuted || !this.ctx) return;
    
    try {
      const now = this.ctx.currentTime + time;
      const currentVolume = this.isMuted ? 0 : this.volume * 0.08;
      
      const chord = [523, 659, 784];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = currentVolume * 0.5;
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(now + i * 0.06);
        osc.stop(now + 1.8);
      });
      
      const noteFreq = this.melody[this.noteIndex % this.melody.length];
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = noteFreq;
      gain2.gain.value = currentVolume * 0.4;
      osc2.connect(gain2);
      gain2.connect(this.gainNode);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.35);
      
      this.noteIndex++;
      
      const delay = 0.5 + Math.random() * 0.3;
      this.timeoutId = setTimeout(() => {
        this.scheduleNote(time + delay);
      }, delay * 1000);
      
    } catch(e) {}
  },
  
  stop() {
    this.isPlaying = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  },
  
  toggle() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    
    this.isMuted = !this.isMuted;
    
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume * 0.08;
    }
    
    if (this.isMuted) {
      this.stop();
    } else {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.start();
    }
    
    this.savePrefs();
    this.updateUI();
  },
  
  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val / 100));
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume * 0.08;
    }
    this.savePrefs();
  },
  
  savePrefs() {
    try {
      localStorage.setItem('adventureMusicPrefs', JSON.stringify({
        muted: this.isMuted,
        volume: this.volume
      }));
    } catch(e) {}
  },
  
  loadPrefs() {
    try {
      const saved = localStorage.getItem('adventureMusicPrefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.isMuted = prefs.muted || false;
        this.volume = prefs.volume || 0.3;
        const slider = document.getElementById('musicVolume');
        if (slider) slider.value = this.volume * 100;
      }
    } catch(e) {}
  },
  
  updateUI() {
    const btn = document.getElementById('musicToggleBtn');
    if (btn) {
      btn.classList.toggle('muted', this.isMuted);
    }
  }
};

// Événements Musique
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('musicToggleBtn');
  const volumeSlider = document.getElementById('musicVolume');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      MusicManager.toggle();
    });
  }
  
  if (volumeSlider) {
    volumeSlider.addEventListener('input', function() {
      const val = parseFloat(this.value);
      MusicManager.setVolume(val);
    });
  }
  
  const startMusic = function() {
    if (!MusicManager.ctx) MusicManager.init();
    if (!MusicManager.isPlaying && !MusicManager.isMuted && MusicManager.ctx) {
      if (MusicManager.ctx.state === 'suspended') {
        MusicManager.ctx.resume();
      }
      MusicManager.start();
    }
    document.removeEventListener('click', startMusic);
    document.removeEventListener('touchstart', startMusic);
    document.removeEventListener('keydown', startMusic);
  };
  
  document.addEventListener('click', startMusic);
  document.addEventListener('touchstart', startMusic);
  document.addEventListener('keydown', startMusic);
  
  setTimeout(() => {
    if (!MusicManager.ctx) MusicManager.init();
    if (!MusicManager.isPlaying && !MusicManager.isMuted && MusicManager.ctx) {
      try {
        if (MusicManager.ctx.state === 'suspended') {
          MusicManager.ctx.resume();
        }
        MusicManager.start();
      } catch(e) {}
    }
  }, 3000);
});

// ============================================================
// 26. INITIALISATION
// ============================================================
function init(){
  const hasSave = load();
  unlockZonesForLevel();
  if(!state.parentPin){
    startParentOnboarding();
    return;
  }
  if(hasSave && state.created){
    if(!state.schoolLevel){ toast('Bienvenue ! Choisis ta classe 🏫'); renderCreator(); }
    else renderHome();
  } else {
    state = defaultState();
    state.parentPin = hasSave ? state.parentPin : null;
    renderHome();
  }
}
init();