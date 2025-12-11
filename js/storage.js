/* ============================================================
   STORAGE.JS — LocalStorage helpers and CRUD for clothes & outfits
   ============================================================ */

const _K_CLOTHES = 'vw_clothes';
const _K_OUTFITS = 'vw_outfits';

/* ---------- Clothing CRUD ---------- */

function getClothingList() {
  try {
    const raw = localStorage.getItem(_K_CLOTHES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("getClothingList parse error", e);
    return [];
  }
}

function saveClothingList(list) {
  localStorage.setItem(_K_CLOTHES, JSON.stringify(list));
}

function addClothing(item) {
  const list = getClothingList();
  list.unshift(item); // newest first
  saveClothingList(list);
}

function updateClothing(item) {
  const list = getClothingList().map(i => i.id === item.id ? item : i);
  saveClothingList(list);
}

function deleteClothing(id) {
  const list = getClothingList().filter(i => i.id !== id);
  saveClothingList(list);
}

/* ---------- Outfit CRUD ---------- */

function getOutfits() {
  try {
    const raw = localStorage.getItem(_K_OUTFITS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("getOutfits parse error", e);
    return [];
  }
}

function saveOutfits(list) {
  localStorage.setItem(_K_OUTFITS, JSON.stringify(list));
}

function saveOutfit(outfit) {
  const list = getOutfits();
  list.unshift(outfit);
  saveOutfits(list);
}

function deleteOutfit(id) {
  const list = getOutfits().filter(o => o.id !== id);
  saveOutfits(list);
}
