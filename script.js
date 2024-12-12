const cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            loadItems(data.promos, "promo-items");
            loadItems(data.menu, "general-items");
            displayCart();
        })
        .catch(error => console.error('Error loading the JSON data:', error));
});

// Función para actualizar el link de Google Maps con la dirección de envío
document.getElementById("shipping-address").addEventListener("input", function() {
    const address = this.value.trim();
    const googleMapLink = document.getElementById("google-map-link");

    if (address) {
        googleMapLink.href = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
        googleMapLink.style.display = "block";
    } else {
        googleMapLink.style.display = "none";
    }
});

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

function loadItems(items, containerId) {
    const container = document.getElementById(containerId);
    items.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "menu-item";
        itemDiv.innerHTML = `
            <div class="image-container">
                <!-- Aquí se construye la ruta de la imagen -->
                <img src="./img/Menu/${item.photo}" alt="${item.name}">
            </div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p>Precio: $${item.price}</p>
            <button onclick="addToCart('${item.name}', ${item.price}, '${containerId}')">Agregar</button>
        `;
        container.appendChild(itemDiv);
    });
}

function addToCart(name, price, type) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;  // Incrementa la cantidad si el item ya existe
    } else {
        cart.push({ name, price, type, quantity: 1 });  // Si es nuevo, agrega con cantidad 1
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));  // Guardar en localStorage
    displayCart();
}

function displayCart() {
    const cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";
    let total = 0;  // Variable para acumular el precio total

    cart.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        total += item.price * item.quantity;  // Sumar el precio total (precio * cantidad)

        itemDiv.innerHTML = `
            <p>${item.name} - $${item.price} x ${item.quantity}</p>
            <button onclick="removeFromCart(${index})">Eliminar</button>
            <select onchange="updateQuantity(${index}, this.value)">
                ${[1, 2, 3, 4, 5].map(qty => `<option value="${qty}" ${qty === item.quantity ? 'selected' : ''}>${qty}</option>`).join('')}
            </select>
        `;
        cartContainer.appendChild(itemDiv);
    });

    // Mostrar el precio total
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<p><strong>Total: $${total}</strong></p>`;
    cartContainer.appendChild(totalDiv);
}

function removeFromCart(index) {
    cart.splice(index, 1);  // Eliminar el item del carrito
    localStorage.setItem('cart', JSON.stringify(cart));  // Guardar en localStorage
    displayCart();
}

function updateQuantity(index, quantity) {
    cart[index].quantity = parseInt(quantity, 10);  // Actualizar la cantidad
    localStorage.setItem('cart', JSON.stringify(cart));  // Guardar en localStorage
    displayCart();
}

// Función para manejar el envío del pedido
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

    // Calcular el precio total
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    const message = `
        *Nombre*: ${userName}
        *Promociones*: ${promoItems}
        *Individual*: ${generalItems}
        *Retiro en local*: ${pickup}
        *Método de pago*: ${paymentMethod}
        *Dirección de Envío*: ${shippingAddress || 'No aplica'}
        *Precio Total*: $${total}  <!-- Aquí se agrega el precio total -->
        ${googleMapLink ? '*Google Maps*: ' + googleMapLink : ''}
        ${paymentMethod === "mercado_pago" ? '*Alias de Mercado Pago*: DonjuanDemo\n*A nombre de*: Juan Demo' : ''}
    `;

    const whatsappUrl = `https://wa.me/2617735869?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
}



function toggleCart() {
    const cartElement = document.getElementById("cart");
    cartElement.classList.toggle("cart-visible");
}

function clearCart() {
    localStorage.removeItem('cart');  // Vaciar el carrito del localStorage
    cart.length = 0;  // Limpiar el arreglo del carrito
    displayCart();
}
