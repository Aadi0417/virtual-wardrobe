/* ============================================================
   WARDROBE PAGE — DISPLAY, FILTER, DELETE
   ============================================================ */

let clothes = [];

/* ------------------------------
   On page load
------------------------------ */

window.onload = () => {
    clothes = getClothingList();
    populateColorFilter();
    renderClothes();
};

/* ------------------------------
   Populate color dropdown
------------------------------ */

function populateColorFilter() {
    const filterColor = document.getElementById("filterColor");
    const colors = [...new Set(clothes.map(c => c.color))];

    colors.forEach(col => {
        const opt = document.createElement("option");
        opt.value = col;
        opt.innerText = col;
        filterColor.appendChild(opt);
    });
}

/* ------------------------------
   Render clothing items
------------------------------ */

function renderClothes() {
    const grid = document.getElementById("wardrobeGrid");
    grid.innerHTML = "";

    let list = [...clothes];

    // Filters
    const fCat = document.getElementById("filterCategory").value;
    const fColor = document.getElementById("filterColor").value;
    const fSeas = document.getElementById("filterSeason").value;
    const fOcc = document.getElementById("filterOccasion").value;
    const search = document.getElementById("searchInput").value.toLowerCase();

    if (fCat) list = list.filter(i => i.category === fCat);
    if (fColor) list = list.filter(i => i.color === fColor);
    if (fSeas) list = list.filter(i => i.season === fSeas);
    if (fOcc) list = list.filter(i => i.occasion === fOcc);

    if (search) {
        list = list.filter(i =>
            i.color.toLowerCase().includes(search) ||
            i.tags.join(" ").toLowerCase().includes(search)
        );
    }

    // If empty
    if (list.length === 0) {
        grid.innerHTML = `<p id="emptyLabel">No items found.</p>`;
        return;
    }

    // Render cards
    list.forEach(item => {
        const card = document.createElement("div");
        card.className = "cloth-card glow-hover";

        card.innerHTML = `
            <img src="${item.img}">

            <div class="cloth-info">
                <b>${item.category}</b> • ${item.color} <br>
                ${item.season} • ${item.occasion}
            </div>

            <div class="cloth-actions">
                <span class="delete-btn" onclick="removeItem('${item.id}')">Delete</span>
            </div>
        `;

        grid.appendChild(card);
    });
}

/* ------------------------------
   Delete an item
------------------------------ */

function removeItem(id) {
    deleteClothing(id);
    clothes = getClothingList();
    renderClothes();
    showToast("Item removed");
}

/* ------------------------------
   Toast
------------------------------ */

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 2000);
}
