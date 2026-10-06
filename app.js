// PROMIJENI SAMO OVU LINIJU AKO ŽELIŠ DRUGU ŠIFRU:
const SITE_PASSWORD = 'kalamperovic';

const FIELDS = {
  izdavac: 'Izdavač', mjesto: 'Mjesto izdanja', urednik: 'Lektor / urednik', datum: 'Datum izdanja',
  izdanje: 'Broj izdanja', zanr: 'Žanr', jezik: 'Jezik', prevodilac: 'Prevodilac', povez: 'Povez',
  stranica: 'Stranica', stanje: 'Stanje', polica: 'Polica', biljeske: 'Bilješke'
};

let books = [];
const $ = (s) => document.querySelector(s);
const loginScreen = $('#loginScreen'), libraryApp = $('#libraryApp'), loginForm = $('#loginForm');
const passwordInput = $('#password'), passwordError = $('#passwordError');
const results = $('#results'), search = $('#search'), sort = $('#sort'), count = $('#count'), empty = $('#empty');
const dialog = $('#detailsDialog'), dialogContent = $('#dialogContent');

function unlockLibrary() {
  loginScreen.hidden = true;
  libraryApp.hidden = false;
  sessionStorage.setItem('libraryAccess', 'yes');
  setTimeout(() => search.focus(), 50);
}

function lockLibrary() {
  sessionStorage.removeItem('libraryAccess');
  libraryApp.hidden = true;
  loginScreen.hidden = false;
  passwordInput.value = '';
  passwordError.textContent = '';
  setTimeout(() => passwordInput.focus(), 50);
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (passwordInput.value === SITE_PASSWORD) unlockLibrary();
  else {
    passwordError.textContent = 'Pogrešna šifra.';
    passwordInput.select();
  }
});

$('#logout').addEventListener('click', lockLibrary);
if (sessionStorage.getItem('libraryAccess') === 'yes') unlockLibrary();

function normalizeText(value='') {
  return String(value).toLowerCase().replace(/đ/g,'d').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
function tokens(q){ return normalizeText(q).split(' ').filter(Boolean); }
function haystack(book){ return normalizeText(Object.values(book).join(' ')); }
function getYear(v=''){ const m=String(v).match(/(1[5-9]\d{2}|20\d{2}|21\d{2})/); return m ? Number(m[1]) : 0; }
function cmpText(a,b){ return normalizeText(a).localeCompare(normalizeText(b),'sr',{sensitivity:'base'}); }
function filteredBooks(){
  const t=tokens(search.value);
  let arr=books.filter(b=>{ const h=haystack(b); return t.every(x=>h.includes(x)); });
  if(sort.value==='title') arr.sort((a,b)=>cmpText(a.naslov,b.naslov));
  if(sort.value==='author') arr.sort((a,b)=>cmpText(a.autor,b.autor)||cmpText(a.naslov,b.naslov));
  if(sort.value==='yearDesc') arr.sort((a,b)=>getYear(b.datum)-getYear(a.datum)||cmpText(a.naslov,b.naslov));
  if(sort.value==='yearAsc') arr.sort((a,b)=>getYear(a.datum)-getYear(b.datum)||cmpText(a.naslov,b.naslov));
  return arr;
}
function el(tag, cls, text){ const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n; }
function chip(text){ return el('span','chip',text); }
function render(){
  const arr=filteredBooks(); results.replaceChildren();
  const q=search.value.trim(); count.textContent = q ? `${arr.length} od ${books.length} knjiga` : `${books.length} knjiga u biblioteci`;
  empty.hidden=arr.length!==0;
  const frag=document.createDocumentFragment();
  arr.forEach((b)=>{
    const card=el('article','card'); const main=el('div');
    main.append(el('h2','bookTitle',(b.naslov||'BEZ NASLOVA').toUpperCase()),el('div','author',b.autor||'Nepoznat autor'));
    const chips=el('div','chips');
    if(b.datum) chips.append(chip(b.datum)); if(b.izdavac) chips.append(chip(b.izdavac)); if(b.mjesto) chips.append(chip(b.mjesto));
    if(b.jezik) chips.append(chip(b.jezik)); if(b.polica) chips.append(chip(`Polica: ${b.polica}`));
    main.append(chips);
    const btn=el('button','more','Detalji'); btn.type='button'; btn.addEventListener('click',()=>showDetails(b));
    card.append(main,btn); frag.append(card);
  });
  results.append(frag);
}
function showDetails(b){
  dialogContent.replaceChildren();
  dialogContent.append(el('h2','dialogTitle',(b.naslov||'BEZ NASLOVA').toUpperCase()),el('p','dialogAuthor',b.autor||'Nepoznat autor'));
  const dl=el('dl','detailGrid');
  Object.entries(FIELDS).forEach(([key,label])=>{ if(!b[key])return; dl.append(el('dt','',label),el('dd','',b[key])); });
  dialogContent.append(dl); dialog.showModal();
}

fetch('books.json',{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('books.json');return r.json();})
  .then(data=>{books=data;render();})
  .catch(()=>{count.textContent='Greška pri učitavanju';empty.hidden=false;empty.querySelector('strong').textContent='Biblioteka nije učitana.';});

search.addEventListener('input',render); sort.addEventListener('change',render);
$('#clear').addEventListener('click',()=>{search.value='';render();search.focus();});
$('#closeDialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',(e)=>{if(e.target===dialog)dialog.close();});
document.addEventListener('keydown',(e)=>{
  if(!libraryApp.hidden && e.key==='/' && document.activeElement!==search){e.preventDefault();search.focus();}
});
