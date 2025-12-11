/* ==========================================================
   ADD PAGE — IMAGE UPLOAD, PREVIEW, SAVE TO STORAGE
   ========================================================== */

let uploadedImageBase64 = "";

/* ----------------------------------------------
   Handle file input (manual select)
---------------------------------------------- */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) readImageFile(file);
}

/* ----------------------------------------------
   Handle drag & drop
---------------------------------------------- */
function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) readImageFile(file);
}

/* ----------------------------------------------
   Read image → convert to Base64 → preview
---------------------------------------------- */
function readImageFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageBase64 = e.target.result;

        const previewImg = document.getElementById("previewImg");
        previewImg.src = uploadedImageBase64;
        previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
}

/* ----------------------------------------------
   Save Clothing Item
---------------------------------------------- */
function saveClothing() {
    if (!uploadedImageBase64) {
        showToast("Upload an image first!");
        return;
    }

    const item = {
        id: generateID(),
        img: uploadedImageBase64,
        category: document.getElementById("category").value,
        color: document.getElementById("color").value,
        season: document.getElementById("season").value,
        occasion: document.getElementById("occasion").value,
        tags: document.getElementById("tags").value.split(",").map(t => t.trim()),
        createdAt: Date.now()
    };

    if (!item.category || !item.color || !item.season || !item.occasion) {
        showToast("Fill all fields!");
        return;
    }

    addClothing(item);
    showToast("Clothing Saved!");

    // Clear fields
    document.getElementById("category").value = "";
    document.getElementById("color").value = "";
    document.getElementById("season").value = "";
    document.getElementById("occasion").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("previewImg").style.display = "none";
}

/* ----------------------------------------------
   Toast popup
---------------------------------------------- */
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}
