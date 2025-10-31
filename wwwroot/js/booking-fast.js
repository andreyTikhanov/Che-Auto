// wwwroot/js/booking-fast.js (v6)
const makeSel = document.getElementById("make");
const modelSel = document.getElementById("model");

async function fetchJSON(url, timeout = 5000) {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort("timeout"), timeout);
    try {
        const r = await fetch(url, { signal: ctrl.signal, cache: "no-cache" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        return await r.json();
    } finally { clearTimeout(tm); }
}

function api(path) {
    // относительный путь (работает и из подпапки)
    const base = new URL(".", location.href).pathname;
    return `${base}api/${path}`;
}

(async function init() {
    if (!makeSel || !modelSel) return;
    makeSel.innerHTML = '<option value="" disabled selected>Загрузка…</option>';

    let makes = [];
    try { makes = await fetchJSON(api("car/makes"), 4000); } catch { }
    if (!Array.isArray(makes)) makes = [];

    makeSel.innerHTML = '<option value="" disabled selected>Выберите марку</option>';
    for (const m of makes) {
        const opt = document.createElement("option");
        opt.value = String(m.id || "").toLowerCase();
        opt.textContent = m.name || "";
        if (opt.value && opt.textContent) makeSel.appendChild(opt);
    }
})();

makeSel?.addEventListener("change", async () => {
    const makeId = (makeSel.value || "").toLowerCase();
    modelSel.disabled = true;
    modelSel.innerHTML = '<option value="" disabled selected>Загрузка…</option>';

    let models = [];
    try { models = await fetchJSON(api(`car/models?make=${encodeURIComponent(makeId)}`), 4000); } catch { }
    if (!Array.isArray(models)) models = [];

    modelSel.innerHTML = '<option value="" disabled selected>Выберите модель</option>';
    for (const md of models) {
        const opt = document.createElement("option");
        opt.value = opt.textContent = md;
        modelSel.appendChild(opt);
    }
    modelSel.disabled = models.length === 0;
});
