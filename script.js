document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('map').setView([-8.047562, -34.877044], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker = null;

    // Geolocalização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            const currentLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
                icon: L.divIcon({
                    className: 'current-location-marker',
                    html: '<i class="fas fa-circle-notch fa-spin text-blue-500 text-2xl"></i>',
                    iconSize: [24, 24]
                })
            }).addTo(map);

            currentLocationMarker.bindPopup("Sua localização atual").openPopup();
            map.setView([userLocation.lat, userLocation.lng], 15);

            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('address').value = data.display_name || '';
                });
        });
    }

    // Clique no mapa
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (marker) map.removeLayer(marker);

        marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'selected-location-marker',
                html: '<i class="fas fa-map-marker-alt text-red-500 text-3xl"></i>',
                iconSize: [30, 30]
            })
        }).addTo(map);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('address').value = data.display_name || '';
            });
    });

    // Envio do formulário
    document.getElementById('requestForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const requestType = formData.get('requestType') === 'creation' ? 'Criação' : 'Manutenção';
        const address = formData.get('address');
        const details = formData.get('details');
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');

        const subject = `Solicitação de ${requestType} de Rampa - ${address}`;
        let body = `Tipo de Solicitação: ${requestType} de Rampa\n`;
        body += `Endereço: ${address}\n`;
        body += `Detalhes: ${details}\n\n`;
        body += `Solicitante:\nNome: ${name}\nE-mail: ${email}\nTelefone: ${phone || 'Não informado'}\n`;

        window.location.href =
            `mailto:acessibilidade@recife.pe.gov.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        alert('Seu cliente de e-mail será aberto com a solicitação preenchida.');
    });
});
