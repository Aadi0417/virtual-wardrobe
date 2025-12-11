/* ============================================================
   SAVED.JS — Manage saved outfits listing, view, delete, export & import
   ============================================================ */

window.addEventListener('load', () => {
  renderSavedOutfits();

  // bind import file control (if present)
  const inp = document.getElementById('importFile');
  if (inp) {
    inp.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) importOutfitsFromFile(e.target.files[0]);
      // clear input so same file can be picked again if needed
      e.target.value = '';
    });
  }
});

/* Render saved outfits grid */
function renderSavedOutfits() {
  const grid = document.getElementById('savedGrid');
  const emptyLabel = document.getElementById('savedEmpty');
  grid.innerHTML = '';

  const q = (document.getElementById('searchSaved')?.value || '').toLowerCase();

  const outfits = getOutfits();
  const filtered = outfits.filter(o => {
    if (!q) return true;
    return (o.name || '').toLowerCase().includes(q) ||
           (o.occasion || '').toLowerCase().includes(q);
  });

  if (!filtered.length) {
    emptyLabel.style.display = 'block';
    return;
  } else {
    emptyLabel.style.display = 'none';
  }

  filtered.forEach(o => {
    const card = document.createElement('div');
    card.className = 'saved-card glass';

    card.innerHTML = `
      <div class="saved-thumb">
        <img src="${o.thumb || ''}" style="width:100%;height:100%;object-fit:cover;">
      </div>

      <div class="saved-meta">
        <div style="font-weight:600">${o.name || 'Unnamed Outfit'}</div>
        <div class="text-muted small">${o.occasion || '—'} • ${new Date(o.createdAt).toLocaleString()}</div>
      </div>

      <div class="saved-actions">
        <button class="btn" onclick='viewOutfit("${o.id}")'>View</button>
        <button class="btn" onclick='exportOutfitById("${o.id}")'>Export</button>
        <button class="btn" style="color:var(--neon-pink)" onclick='confirmDelete("${o.id}")'>Delete</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* View outfit modal: show composed preview and breakdown */
function viewOutfit(id) {
  const outfits = getOutfits();
  const o = outfits.find(x => x.id === id);
  if (!o) { showTmpToast('Not found'); return; }

  // Build modal content including thumbnail and item breakdown (resolve item ids)
  const clothes = getClothingList();
  const top = clothes.find(c => c.id === o.topId) || null;
  const bottom = clothes.find(c => c.id === o.bottomId) || null;
  const shoes = clothes.find(c => c.id === o.shoesId) || null;
  const acc = clothes.find(c => c.id === o.accessoryId) || null;

  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div style="display:flex;gap:12px;align-items:flex-start;">
      <div style="width:210px;flex-shrink:0;">
        <div style="width:210px;height:320px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
          <img src="${o.thumb || ''}" style="width:100%;height:100%;object-fit:cover;">
        </div>
      </div>
      <div style="flex:1;">
        <h3 style="margin-bottom:6px">${o.name || 'Outfit'}</h3>
        <div class="text-muted small">${o.occasion || '—'}</div>

        <div style="margin-top:12px;">
          <div><strong>Top:</strong> ${top ? `${top.category} • ${top.color}` : '—'}</div>
          <div><strong>Bottom:</strong> ${bottom ? `${bottom.category} • ${bottom.color}` : '—'}</div>
          <div><strong>Shoes:</strong> ${shoes ? `${shoes.category} • ${shoes.color}` : '—'}</div>
          <div><strong>Accessory:</strong> ${acc ? `${acc.category} • ${acc.color}` : '—'}</div>
        </div>

        <div style="margin-top:14px; display:flex; gap:8px;">
          <button class="btn btn-primary" onclick='exportOutfitById("${o.id}")'>Export JSON</button>
          <button class="btn" onclick='closeModal()'>Close</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal').classList.add('active');
}

/* Close modal */
function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

/* Confirm delete */
function confirmDelete(id) {
  if (!confirm('Delete this outfit? This cannot be undone.')) return;
  deleteOutfit(id);
  renderSavedOutfits();
  showTmpToast('Deleted');
}

/* handle file import triggered from UI */
function handleImport(e) {
  const file = e.target.files && e.target.files[0];
  if (file) importOutfitsFromFile(file);
}

/* small toast */
function showTmpToast(msg){
  const t = document.getElementById('toast');
  if (t) {
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(()=> t.classList.remove('show'), 1600);
  } else alert(msg);
}
