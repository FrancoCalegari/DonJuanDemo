let map, marker;
let googleMapLink = '';  // Variable global para almacenar el enlace de Google Maps

// Inicializa el mapa de Google Maps
function initMap() {
    const defaultLocation = { lat: -32.856206487911784, lng: -68.81340490333557 };  // Coordenadas de Mendoza, Las Heras, Argentina
    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 14,  // Ajusta el zoom según tu preferencia
    });

    // Agrega un marcador en la ubicación predeterminada
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,  // Permite mover el marcador
        title: "Selecciona tu dirección"
    });

    // Añadir escucha al movimiento del marcador
    google.maps.event.addListener(marker, 'dragend', function() {
        const latLng = marker.getPosition();
        document.getElementById("shipping-address").value = `${latLng.lat()}, ${latLng.lng()}`;
    });
}

// Actualiza la dirección seleccionada en el campo de dirección y genera un enlace de Google Maps
function confirmAddress() {
    const addressField = document.getElementById("shipping-address");
    const latLng = marker.getPosition();
    googleMapLink = `https://www.google.com/maps?q=${latLng.lat()},${latLng.lng()}`;
    addressField.value = `Lat: ${latLng.lat()}, Lng: ${latLng.lng()}`;
    
    let googleMapLinkElement = document.getElementById("google-map-link");
    if (!googleMapLinkElement) {
        document.body.appendChild(googleMapLinkElement);
    } else {
        googleMapLinkElement.href = googleMapLink;
    }
}

// Función para mostrar u ocultar el campo de dirección de envío
function toggleShippingAddress() {
    const pickupCheckbox = document.getElementById("pickup");
    const shippingAddressContainer = document.getElementById("shipping-address-container");

    // Si no se selecciona "Retiro en local", mostrar el campo de dirección
    if (pickupCheckbox.checked) {
        shippingAddressContainer.style.display = "none";
    } else {
        shippingAddressContainer.style.display = "block";
    }
}

// Función para mostrar u ocultar los detalles de Mercado Pago
function togglePaymentDetails() {
    const paymentMethod = document.getElementById("payment-method").value;
    const mercadoPagoDetails = document.getElementById("mercado-pago-details");

    if (paymentMethod === "mercado_pago") {
        mercadoPagoDetails.style.display = "block";
    } else {
        mercadoPagoDetails.style.display = "none";
    }
}

// Función para enviar el pedido
function sendOrder() {
    const userName = document.getElementById("user-name").value.trim();
    if (!userName) {
        alert("El nombre y apellido son obligatorios.");
        return;
    }

    const promoItems = cart.filter(item => item.type === "promo-items").map(item => `${item.name} x${item.quantity}`).join(", ");
    const generalItems = cart.filter(item => item.type === "general-items").map(item => `${item.name} x${item.quantity}`).join(", ");
    const pickup = document.getElementById("pickup").checked ? "Sí" : "No";
    const paymentMethod = document.getElementById("payment-method").value;

    let shippingAddress = '';

    if (!document.getElementById("pickup").checked) {
        shippingAddress = document.getElementById("shipping-address").value.trim();
        if (!shippingAddress) {
            alert("La dirección de envío es obligatoria si no seleccionas 'Retiro en local'.");
            return;
        }
    }

    const message = `
        *Nombre*: ${userName}
        *Promociones*: ${promoItems}
        *Individual*: ${generalItems}
        *Retiro en local*: ${pickup}
        *Método de pago*: ${paymentMethod}
        *Dirección de Envío*: ${shippingAddress || 'No aplica'}
        ${googleMapLink ? '*Google Maps*: ' + googleMapLink : ''}
        ${paymentMethod === "mercado_pago" ? '*Alias de Mercado Pago*: DonjuanDemo\n*A nombre de*: Juan Demo' : ''}
    `;

    const whatsappUrl = `https://wa.me/2617735869?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
}
