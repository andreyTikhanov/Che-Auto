document.addEventListener('DOMContentLoaded', function() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    navbarToggler.addEventListener('click', function() {
        if (navbarCollapse.style.right === '0px') {
            navbarCollapse.style.right = '-100%';
        } else {
            navbarCollapse.style.right = '0';
        }
    });

    document.addEventListener('click', function(event) {
        if (!navbarCollapse.contains(event.target) && !navbarToggler.contains(event.target)) {
            navbarCollapse.style.right = '-100%';
        }
    });
});
