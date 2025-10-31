// wwwroot/js/booking-fast.js (v8) — фикс путей и id полей

const makeSel = document.getElementById("make");
const modelSel = document.getElementById("model");
const form = document.getElementById("bookingForm");

// поддерживаем оба варианта id: customerName/customerPhone ИЛИ name/phone
const nameInp = document.getElementById("customerName") || document.getElementById("name");
const phoneInp = document.getElementById("customerPhone") || document.getElementById("phone");

// если нет submitBooking — возьмём первую submit-кнопку формы
const submitBt = document.getElementById("submitBooking") || form?.querySelector('button[type="submit"]');

async function fetchJSON(url, timeout = 5000) {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort("timeout"), timeout);
    try {
        const r = await fetch(url, { signal: ctrl.signal, cache: "no-cache" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        return await r.json();
    } finally { clearTimeout(tm); }
}
async function postJSON(url, data, timeout = 8000) {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort("timeout"), timeout);
    try {
        const r = await fetch(url, {
            method: "POST",
            signal: ctrl.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
        return await r.json().catch(() => ({}));
    } finally { clearTimeout(tm); }
}

// ВАЖНО: эндпоинты на корне приложения
function api(path) { return `/api/${path}`; }

// ============== Загрузка марок/моделей ==============
(async function init() {
    if (!makeSel || !modelSel) return;
    makeSel.innerHTML = '<option value="" disabled selected>Загрузка…</option>';

    let makes = [];
    try { makes = await fetchJSON(api("car/makes"), 4000); } catch { }
    if (!Array.isArray(makes)) makes = [];

    makeSel.innerHTML = '<option value="" disabled selected>Выберите марку</option>';
    for (const m of makes) {
        const opt = document.createElement("option");
        opt.value = String(m.id || "");
        opt.textContent = m.name || "";
        if (opt.value && opt.textContent) makeSel.appendChild(opt);
    }
})();

makeSel?.addEventListener("change", async () => {
    const makeId = (makeSel.value || "");
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

// ============== Валидация имени и телефона ==============
function validateNamePhone() {
    let ok = true;
    const name = (nameInp?.value || "").trim();
    const phone = (phoneInp?.value || "").trim();

    if (nameInp) {
        if (name.length < 2) { nameInp.setCustomValidity("Введите имя (минимум 2 символа)"); ok = false; }
        else { nameInp.setCustomValidity(""); }
    }
    if (phoneInp) {
        const phoneOk = /^(\+?\d[\d\s()\-]{6,}\d)$/.test(phone);
        if (!phoneOk) { phoneInp.setCustomValidity("Введите корректный номер телефона"); ok = false; }
        else { phoneInp.setCustomValidity(""); }
    }

    if (!ok) {
        if (nameInp && !nameInp.checkValidity()) nameInp.reportValidity();
        else if (phoneInp && !phoneInp.checkValidity()) phoneInp.reportValidity();
    }
    return ok;
}
nameInp?.addEventListener("input", () => nameInp.setCustomValidity(""));
phoneInp?.addEventListener("input", () => phoneInp.setCustomValidity(""));

// ============== Отправка заявки + отложенный редирект ==============
form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateNamePhone()) return;

    const payload = {
        name: (nameInp?.value || "").trim(),
        phone: (phoneInp?.value || "").trim(),
        makeId: makeSel?.value || null,
        makeName: makeSel?.selectedOptions?.[0]?.textContent || null,
        model: modelSel?.value || null,
        ts: new Date().toISOString()
    };

    submitBt && (submitBt.disabled = true);
    try {
        await postJSON(api("appointments"), payload, 10000);
        showRedirectBanner({ seconds: 5, target: "/" });
    } catch (err) {
        console.error(err);
        alert("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
        submitBt && (submitBt.disabled = false);
    }
});

// Баннер редиректа с отменой
function showRedirectBanner({ seconds = 5, target = "/" } = {}) {
    let remaining = seconds;
    let timerId = null;

    let bar = document.getElementById("redirect-banner");
    if (!bar) {
        bar = document.createElement("div");
        bar.id = "redirect-banner";
        bar.style.position = "fixed";
        bar.style.left = "50%";
        bar.style.bottom = "20px";
        bar.style.transform = "translateX(-50%)";
        bar.style.background = "#222";
        bar.style.color = "#fff";
        bar.style.padding = "12px 16px";
        bar.style.borderRadius = "10px";
        bar.style.boxShadow = "0 6px 30px rgba(0,0,0,0.25)";
        bar.style.zIndex = "9999";
        bar.style.fontSize = "14px";
        bar.style.display = "flex";
        bar.style.gap = "12px";
        bar.style.alignItems = "center";
        document.body.appendChild(bar);
    } else {
        bar.innerHTML = "";
        bar.style.display = "flex";
    }

    const msg = document.createElement("span");
    const cancelBtn = document.createElement("button");
    const goBtn = document.createElement("button");

    function updText() { msg.textContent = `Заявка отправлена. Переход на главную через ${remaining} сек.`; }
    updText();

    cancelBtn.textContent = "Отменить";
    Object.assign(cancelBtn.style, { background: "#555", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" });

    goBtn.textContent = "Перейти сейчас";
    Object.assign(goBtn.style, { background: "#ff5a1f", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" });

    bar.append(msg, cancelBtn, goBtn);

    function clearTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
    cancelBtn.addEventListener("click", () => { clearTimer(); bar.style.display = "none"; });
    goBtn.addEventListener("click", () => { clearTimer(); location.assign(target); });

    timerId = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) { clearTimer(); location.assign(target); }
        else { updText(); }
    }, 1000);
}
// ========== Local Storage Cache ==========
function saveUserCache(data) {
    localStorage.setItem("cheauto_user", JSON.stringify(data));
}

function loadUserCache() {
    try { return JSON.parse(localStorage.getItem("cheauto_user") || "{}"); }
    catch { return {}; }
}

// при загрузке страницы — заполняем поля
(async function restoreUserFields() {
    const cache = loadUserCache();
    if (cache.name) nameInp.value = cache.name;
    if (cache.phone) phoneInp.value = cache.phone;

    // Если в localStorage есть телефон — пробуем подтянуть актуальные данные из БД
    if (cache.phone) {
        const user = await fetchLastUser(cache.phone);
        if (user) {
            if (user.name && !nameInp.value) nameInp.value = user.name;
            if (user.makeId) {
                makeSel.value = user.makeId;
                // Загружаем модели для этой марки
                let models = [];
                try {
                    models = await fetchJSON(api(`car/models?make=${encodeURIComponent(user.makeId)}`), 4000);
                } catch { }
                modelSel.innerHTML = '<option value="" disabled selected>Выберите модель</option>';
                for (const md of models) {
                    const opt = document.createElement("option");
                    opt.value = opt.textContent = md;
                    modelSel.appendChild(opt);
                }
                modelSel.disabled = models.length === 0;

                if (user.modelName) modelSel.value = user.modelName;
            }
        }
    }

    // Если нет телефона — просто восстановим кеш
    if (cache.makeId) makeSel.value = cache.makeId;
    if (cache.model) modelSel.value = cache.model;
})();


// при отправке заявки — сохраняем в localStorage
form?.addEventListener("submit", () => {
    const data = {
        name: nameInp.value,
        phone: phoneInp.value,
        makeId: makeSel.value,
        makeName: makeSel.selectedOptions?.[0]?.textContent || "",
        model: modelSel.value
    };
    saveUserCache(data);
});

async function fetchLastUser(phone) {
    try {
        const resp = await fetch(`/api/user/last?phone=${encodeURIComponent(phone)}`, { cache: "no-store" });
        if (resp.ok) return await resp.json();
    } catch (e) { console.warn("fetchLastUser failed", e); }
    return null;
}


