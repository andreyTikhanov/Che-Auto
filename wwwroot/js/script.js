// бургер-меню
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger?.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', opened ? 'true' : 'false');
});

// плавный скролл по якорям
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        nav.classList.remove('open');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
