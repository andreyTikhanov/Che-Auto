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

document.addEventListener("DOMContentLoaded", () => {
    const fadeEls = document.querySelectorAll(".fade-in");

    // ВКЛЮЧАЕМ анимацию только при наличии JS
    fadeEls.forEach(el => el.classList.add("will-animate"));

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    fadeEls.forEach(el => observer.observe(el));
});
// Гарантированный переход на /booking.html (мобильные клики + закрытие бургера)
document.querySelectorAll('.js-booking-link').forEach(a => {
    a.addEventListener('click', (e) => {
        // не трогаем якорные ссылки, у нас тут именно переход на страницу
        e.stopPropagation(); // на всякий случай, чтобы бургер/оверлеи не перехватили
        // если меню открыто — закроем, но переход всё равно совершим
        const nav = document.getElementById('nav');
        nav?.classList.remove('open');
        // жёсткий переход
        window.location.href = '/booking.html';
    });
});
