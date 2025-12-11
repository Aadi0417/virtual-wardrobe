/* ============================================================
   PLANNER.JS — Outfit Planner logic
   ============================================================ */

/* State */
let clothes = [];
let selected = {
  top: null,
  bottom: null,
  shoes: null,
  acc: null
};

/* Elements */
const topListEl = () => document.getElementById('topList');
const bottomListEl = () => document.getElementById('bottomList');
const shoesListEl = () => document.getElementById('shoesList');
const accListEl = () => document.getElementById('accList');

const previewStage = () => document.getElementById('previewStage');
const metaName = () => document.getElementById('metaName');
const metaOccasion = () => document.getElementById('metaOccasion');
const suggestionsRow = () => document.getElementById('suggestionsRow');

window.addEventListener('load', initPlanner);

function initPlanner(){
  clothes = getClothingList();
  renderSelectors();
  renderPreview();
  renderSavedSuggestions();

  document.getElementById('saveOutfitBtn').addEventListener('click', onSaveOutfit);
  document.getElementById('suggestBtn').addEventListener('click', suggestOutfit);
}

/* Render the selectors (thumbnails) grouped by category */
function renderSelectors() {
  clearChildren(topListEl());
  clearChildren(bottomListEl());
  clearChildren(shoesListEl());
  clearChildren(accListEl());

  clothes.forEach(item => {
    const thumb = makeThumbEl(item);
    if (item.category === 'Top') topListEl().appendChild(thumb);
    else if (item.category === 'Bottom') bottomListEl().appendChild(thumb);
    else if (item.category === 'Shoes') shoesListEl().appendChild(thumb);
    else accListEl().appendChild(thumb);
  });

  if (!topListEl().children.length) topListEl().innerHTML = `<p class="text-muted">No tops yet</p>`;
  if (!bottomListEl().children.length) bottomListEl().innerHTML = `<p class="text-muted">No bottoms yet</p>`;
  if (!shoesListEl().children.length) shoesListEl().innerHTML = `<p class="text-muted">No shoes yet</p>`;
  if (!accListEl().children.length) accListEl().innerHTML = `<p class="text-muted">No accessories yet</p>`;
}

/* create thumbnail DOM for an item */
function makeThumbEl(item) {
  const div = document.createElement('div');
  div.className = 'item-thumb';
  div.title = `${item.category} • ${item.color}`;

  const img = document.createElement('img');
  img.src = item.img;
  div.appendChild(img);

  div.onclick = () => {
    toggleSelect(item);
    // toggle selected visual
    if (isSelected(item)) div.classList.add('selected');
    else div.classList.remove('selected');
  };

  return div;
}

/* selection helpers */
function isSelected(item) {
  return selected.top?.id === item.id || selected.bottom?.id === item.id ||
         selected.shoes?.id === item.id || selected.acc?.id === item.id;
}

function toggleSelect(item) {
  const slot = slotForCategory(item.category);

  if (!slot) return;

  // If clicking same item => deselect
  if (selected[slot] && selected[slot].id === item.id) {
    selected[slot] = null;
  } else {
    selected[slot] = item;
  }

  updateMeta();
  renderPreview();
}

/* map category → slot key */
function slotForCategory(cat) {
  const c = (cat || '').toLowerCase();
  if (c === 'top') return 'top';
  if (c === 'bottom') return 'bottom';
  if (c === 'shoes') return 'shoes';
  return 'acc';
}

/* render live preview by layering images (tops above bottoms etc) */
function renderPreview() {
  const stage = previewStage();
  // remove previous layers except mannequin
  Array.from(stage.querySelectorAll('.layer')).forEach(el => el.remove());

  // stacking order: bottom -> shoes -> top -> acc (top visually above)
  const order = ['bottom', 'shoes', 'top', 'acc'];
  order.forEach(slot => {
    const item = selected[slot];
    if (item) {
      const im = document.createElement('img');
      im.src = item.img;
      im.className = 'layer';
      // small size difference per slot for visual balance
      if (slot === 'top') im.style.width = '66%';
      if (slot === 'bottom') im.style.width = '62%';
      if (slot === 'shoes') im.style.width = '42%';
      if (slot === 'acc') im.style.width = '36%';
      // position offsets to make layering natural
      if (slot === 'shoes') im.style.bottom = '6%';
      if (slot === 'top') im.style.top = '10%';
      if (slot === 'bottom') im.style.top = '38%';
      if (slot === 'acc') im.style.top = '20%';

      stage.appendChild(im);
    }
  });

  updateMeta();
}

/* update metadata under preview */
function updateMeta() {
  const name = document.getElementById('outfitName').value || '—';
  metaName().innerText = name;
  const occ = document.getElementById('plannerOccasion').value || (selected.top?.occasion || selected.bottom?.occasion || selected.shoes?.occasion) || '—';
  metaOccasion().innerText = occ;
}

/* Save outfit flow */
async function onSaveOutfit() {
  // basic validation: at least top or bottom or shoes
  if (!selected.top && !selected.bottom && !selected.shoes) {
    showToast('Select at least one item');
    return;
  }

  const name = document.getElementById('outfitName').value || 'My Outfit';
  const outfit = {
    id: generateID(),
    name,
    topId: selected.top?.id || null,
    bottomId: selected.bottom?.id || null,
    shoesId: selected.shoes?.id || null,
    accessoryId: selected.acc?.id || null,
    occasion: document.getElementById('plannerOccasion').value || (selected.top?.occasion || selected.bottom?.occasion || selected.shoes?.occasion) || '',
    createdAt: Date.now()
  };

  // build composite thumbnail using selected images
  const imageSources = [selected.top?.img, selected.bottom?.img, selected.shoes?.img, selected.acc?.img].filter(Boolean);
  const thumb = await createCompositeThumbnail(imageSources, 400, 600);
  outfit.thumb = thumb;

  saveOutfit(outfit);
  showToast('Outfit saved!');
  renderSavedSuggestions(); // refresh saved/suggested list
}

/* Suggest outfit algorithm (simple rule-based) */
function suggestOutfit() {
  const occasion = document.getElementById('plannerOccasion').value;

  // prefer matching occasion, else random
  const byOcc = (occ) => clothes.filter(i => i.occasion === occ);
  let topCands = [], bottomCands = [], shoeCands = [];

  if (occasion) {
    topCands = clothes.filter(c => c.category === 'Top' && c.occasion === occasion);
    bottomCands = clothes.filter(c => c.category === 'Bottom' && c.occasion === occasion);
    shoeCands = clothes.filter(c => c.category === 'Shoes' && c.occasion === occasion);
  }

  // fallback to general category lists
  if (!topCands.length) topCands = clothes.filter(c => c.category === 'Top');
  if (!bottomCands.length) bottomCands = clothes.filter(c => c.category === 'Bottom');
  if (!shoeCands.length) shoeCands = clothes.filter(c => c.category === 'Shoes');

  // simple color harmonizing: pick first top, then bottom with same first color token if possible
  const pickRandom = arr => arr.length ? arr[Math.floor(Math.random()*arr.length)] : null;

  const chosenTop = pickRandom(topCands);
  let chosenBottom = null;
  if (chosenTop) {
    // try to find bottom with same color
    const sameColorBottoms = bottomCands.filter(b => b.color && chosenTop.color && b.color.split(' ')[0].toLowerCase() === chosenTop.color.split(' ')[0].toLowerCase());
    chosenBottom = pickRandom(sameColorBottoms.length ? sameColorBottoms : bottomCands);
  } else {
    chosenBottom = pickRandom(bottomCands);
  }
  const chosenShoes = pickRandom(shoeCands);

  // assign to selected and update visuals
  selected.top = chosenTop;
  selected.bottom = chosenBottom;
  selected.shoes = chosenShoes;
  updateThumbSelections();
  renderPreview();
}

/* updates thumbnail selection state UI (adds 'selected' class to thumbs) */
function updateThumbSelections() {
  // iterate of all thumb elements and toggle selected class if corresponds to current selected state
  const lists = [topListEl(), bottomListEl(), shoesListEl(), accListEl()];
  lists.forEach(container => {
    Array.from(container.querySelectorAll('.item-thumb')).forEach(thumb => {
      // get img src
      const img = thumb.querySelector('img');
      if (!img) return;
      const src = img.src;
      let isSel = false;
      if (selected.top && selected.top.img === src) isSel = true;
      if (selected.bottom && selected.bottom.img === src) isSel = true;
      if (selected.shoes && selected.shoes.img === src) isSel = true;
      if (selected.acc && selected.acc.img === src) isSel = true;

      thumb.classList.toggle('selected', isSel);
    });
  });
}

/* Render saved outfits as suggestions list */
function renderSavedSuggestions() {
  const samples = getOutfits().slice(0,9); // show last 9 saved outfits
  suggestionsRow().innerHTML = '';
  samples.forEach(o => {
    const div = document.createElement('div');
    div.className = 'suggestion-card';
    div.innerHTML = `
      <img src="${o.thumb}" style="width:72px;height:96px;object-fit:cover;border-radius:8px;">
      <div>
        <div style="font-weight:600">${o.name}</div>
        <div class="text-muted small">${new Date(o.createdAt).toLocaleString()}</div>
        <div style="margin-top:6px">
          <button class="btn" onclick='loadOutfitPreview("${o.id}")'>View</button>
          <button class="btn" onclick='exportOutfit("${o.id}")'>Export</button>
        </div>
      </div>
    `;
    suggestionsRow().appendChild(div);
  });
}

/* Load outfit by id into planner preview */
function loadOutfitPreview(id) {
  const outfits = getOutfits();
  const o = outfits.find(x => x.id === id);
  if (!o) {
    showToast('Outfit not found');
    return;
  }
  // map ids to items
  selected.top = clothes.find(c => c.id === o.topId) || null;
  selected.bottom = clothes.find(c => c.id === o.bottomId) || null;
  selected.shoes = clothes.find(c => c.id === o.shoesId) || null;
  selected.acc = clothes.find(c => c.id === o.accessoryId) || null;
  document.getElementById('outfitName').value = o.name;
  document.getElementById('plannerOccasion').value = o.occasion || '';
  updateThumbSelections();
  renderPreview();
}

/* Export outfit as JSON (single file) */
function exportOutfit(id) {
  const outfits = getOutfits();
  const o = outfits.find(x => x.id === id);
  if (!o) { showToast('Outfit not found'); return; }
  const payload = JSON.stringify(o);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${o.name.replace(/\s+/g,'_') || 'outfit'}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* helpers */
function clearChildren(el){ while(el.firstChild) el.removeChild(el.firstChild); }

/* small toast util (exists elsewhere, but define here for safety) */
function showToast(msg){
  const t = document.getElementById('toast');
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 1800);
}
