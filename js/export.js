/* ============================================================
   EXPORT.JS — Utilities to export/import outfits and JSON
   ============================================================ */

/**
 * downloadJSON - helper to download an object as a .json file
 */
function downloadJSON(filename, obj) {
  const payload = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * exportOutfitById - exports a single outfit as JSON file
 */
function exportOutfitById(id) {
  const outfits = getOutfits();
  const outfit = outfits.find(o => o.id === id);
  if (!outfit) {
    showTmpToast('Outfit not found');
    return;
  }
  downloadJSON((outfit.name || 'outfit') + '.json', outfit);
}

/**
 * exportAllOutfits - exports the entire outfits array
 */
function exportAllOutfits() {
  const all = getOutfits();
  downloadJSON('vw_outfits_export.json', all);
}

/**
 * importOutfitsFromFile - read a JSON file and merge outfits (non-destructive)
 */
function importOutfitsFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) {
        showTmpToast('Invalid format: expected an array');
        return;
      }
      // merge but avoid ID collisions
      const existing = getOutfits();
      const existingIds = new Set(existing.map(x => x.id));
      const toAdd = data.filter(o => !existingIds.has(o.id)).map(o => {
        // ensure required fields exist
        return {
          id: o.id || generateID(),
          name: o.name || 'Imported Outfit',
          topId: o.topId || null,
          bottomId: o.bottomId || null,
          shoesId: o.shoesId || null,
          accessoryId: o.accessoryId || null,
          occasion: o.occasion || '',
          createdAt: o.createdAt || Date.now(),
          thumb: o.thumb || null
        };
      });

      if (toAdd.length === 0) {
        showTmpToast('No new outfits to import');
        return;
      }

      const merged = [...toAdd, ...existing];
      saveOutfits(merged);
      showTmpToast(`Imported ${toAdd.length} outfits`);
      // if page has a reload function, call it
      if (typeof renderSavedOutfits === 'function') renderSavedOutfits();
    } catch (err) {
      console.error(err);
      showTmpToast('Import failed: invalid JSON');
    }
  };
  reader.readAsText(file);
}

/* small visual toast used by export/import utilities (uses page toast element if present) */
function showTmpToast(msg) {
  const t = document.getElementById('toast');
  if (t) {
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(()=> t.classList.remove('show'), 1800);
  } else alert(msg);
}
