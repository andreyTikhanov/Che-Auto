(function () {
    const TITLE = "Che Auto";
    const ADDRESS = "Самара, ул. Кабельная, 45а";
    const coords = [53.188843, 50.277125]; // фиксированные координаты

    ymaps.ready(() => {
        const map = new ymaps.Map("ya-map", {
            center: coords,
            zoom: 16,
            controls: ["zoomControl", "fullscreenControl"]
        });

        const placemark = new ymaps.Placemark(
            coords,
            {
                balloonContentHeader: TITLE,
                balloonContentBody: ADDRESS
            },
            { preset: "islands#redAutoIcon" }
        );

        map.geoObjects.add(placemark);
        setupRouteButton(coords);
    });

    function setupRouteButton(coords) {
        const [lat, lon] = coords;
        const btn = document.getElementById("routeBtn");
        if (!btn) return;

        const ua = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua);
        const isAndroid = /android/.test(ua);

        const urlWeb = `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`;
        const urlYNaviApp = `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`;
        const urlYMapsApp = `yandexmaps://maps.yandex.ru/?rtext=~${lat},${lon}&rtt=auto`;

        if (isIOS || isAndroid) {
            btn.href = isAndroid ? urlYNaviApp : urlYMapsApp;
            btn.target = "_self";
            btn.addEventListener("click", () => {
                setTimeout(() => (window.location.href = urlWeb), 1500);
            });
        } else {
            btn.href = urlWeb;
            btn.target = "_blank";
        }
    }
})();
