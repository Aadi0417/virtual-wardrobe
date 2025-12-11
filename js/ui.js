/* ============================================================
   UI.JS — Shared UI Components for the Entire Application
   ============================================================ */

/* ------------------------------------------
   GLOBAL TOAST SYSTEM
------------------------------------------ */

function showToastGlobal(message, duration = 2000) {
    let toast = document.getElementById("globalToast");

    // If toast element doesn't exist, create it
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "globalToast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}

/* ------------------------------------------
   MODAL HELPERS
------------------------------------------ */

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("active");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("active");
}

/* ------------------------------------------
   LOADING OVERLAY
------------------------------------------ */

function showLoading(text = "Loading...") {
    let overlay = document.getElementById("loadingOverlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "loadingOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.6)";
        overlay.style.backdropFilter = "blur(5px)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "200";
        overlay.style.color = "white";
        overlay.style.fontSize = "1.5rem";
        overlay.style.textShadow = "0 0 15px cyan";

        document.body.appendChild(overlay);
    }

    overlay.innerHTML = text;
    overlay.style.display = "flex";
}

function hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.style.display = "none";
}

/* ------------------------------------------
   CONFIRM DIALOG WRAPPER
------------------------------------------ */

function confirmBox(message) {
    return new Promise((resolve) => {
        const yes = confirm(message);
        resolve(yes);
    });
}

/* ------------------------------------------
   ANIMATION HELPERS
------------------------------------------ */

function neonPulseOnce(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.classList.add("neon-pulse");

    setTimeout(() => {
        el.classList.remove("neon-pulse");
    }, 1500);
}

function fadeInElement(el, duration = 400) {
    el.style.opacity = 0;
    el.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => {
        el.style.opacity = 1;
    });
}

/* ------------------------------------------
   SMOOTH SCROLL TO ELEMENT
------------------------------------------ */

function scrollToElement(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

/* ------------------------------------------
   SMALL INLINE TOAST (fallback)
------------------------------------------ */

function quickToast(msg, duration = 1500) {
    let t = document.getElementById("quickToast");
    
    if (!t) {
        t = document.createElement("div");
        t.id = "quickToast";
        t.style.position = "fixed";
        t.style.bottom = "20px";
        t.style.left = "50%";
        t.style.transform = "translateX(-50%)";
        t.style.padding = "12px 20px";
        t.style.background = "rgba(0,234,255,0.2)";
        t.style.border = "1px solid cyan";
        t.style.borderRadius = "10px";
        t.style.color = "white";
        t.style.backdropFilter = "blur(5px)";
        t.style.boxShadow = "0 0 12px cyan";
        t.style.transition = "0.4s";
        t.style.opacity = "0";
        document.body.appendChild(t);
    }

    t.innerText = msg;
    t.style.opacity = "1";

    setTimeout(() => {
        t.style.opacity = "0";
    }, duration);
}
