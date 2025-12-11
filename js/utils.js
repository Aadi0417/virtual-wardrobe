/* ============================================================
   UTILS.JS — helper utilities used across the app
   ============================================================ */

/**
 * generateID - simple UUID-like generator for local objects
 */
function generateID() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9);
}

/**
 * debounce - basic debounce utility
 */
function debounce(fn, delay=250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(()=>fn(...args), delay);
  };
}

/**
 * scaleImageToDataUrl - scale an image file or dataURL to a target width while keeping aspect ratio
 * Accepts a File object or a dataURL string. Returns Promise<dataURL>
 */
function scaleImageToDataUrl(source, maxWidth=1000, quality=0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    img.onerror = (e) => reject(e);

    if (typeof source === 'string' && source.startsWith('data:')) {
      img.src = source;
    } else if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        img.src = ev.target.result;
      };
      reader.readAsDataURL(source);
    } else {
      reject(new Error('Unsupported source for scaleImageToDataUrl'));
    }
  });
}

/**
 * createCompositeThumbnail - draw up to 4 images stacked on canvas to produce a small thumbnail
 * images is an array of dataURLs (strings). Returns Promise<dataURL]
 */
function createCompositeThumbnail(images = [], width = 400, height = 600) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // background (dark transparent)
    ctx.fillStyle = "#0a0f1f";
    ctx.fillRect(0, 0, width, height);

    let loaded = 0;
    const imgEls = [];

    if (images.length === 0) {
      resolve(canvas.toDataURL('image/png'));
      return;
    }

    images.slice(0,4).forEach((src, idx) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => {
        imgEls[idx] = im;
        loaded++;
        if (loaded === Math.min(images.length,4)) {
          // Draw images with simple vertical offset stacking
          const centerX = width/2;
          const baseW = width * 0.7;
          const baseH = height * 0.7;

          imgEls.forEach((el, i) => {
            const scale = 0.9 - (i * 0.12); // slight size cascade
            const w = baseW * scale;
            const h = baseH * scale;
            const x = centerX - w/2;
            const y = height*0.08 + (i * 15);

            ctx.globalAlpha = 1;
            ctx.drawImage(el, x, y, w, h);
          });

          resolve(canvas.toDataURL('image/png'));
        }
      };
      im.onerror = () => {
        // treat missing images as loaded
        loaded++;
        if (loaded === Math.min(images.length,4)) {
          resolve(canvas.toDataURL('image/png'));
        }
      };
      im.src = src;
    });
  });
}
