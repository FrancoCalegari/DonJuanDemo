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
    cart.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        
        itemDiv.innerHTML = `
            <p>${item.name} - $${item.price} x ${item.quantity}</p>
            <button onclick="removeFromCart(${index})">Eliminar</button>
            <select onchange="updateQuantity(${index}, this.value)">
                ${[1, 2, 3, 4, 5].map(qty => `<option value="${qty}" ${qty === item.quantity ? 'selected' : ''}>${qty}</option>`).join('')}
            </select>
        `;
        cartContainer.appendChild(itemDiv);
    });
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

function sendOrder() {
    const promoItems = cart.filter(item => item.type === "promo-items").map(item => `${item.name} x${item.quantity}`).join(", ");
    const generalItems = cart.filter(item => item.type === "general-items").map(item => `${item.name} x${item.quantity}`).join(", ");
    const pickup = document.getElementById("pickup").checked ? "Sí" : "No";
    const paymentMethod = document.getElementById("payment-method").value;

    const message = `
        *Promociones*: ${promoItems}
        *Individual*: ${generalItems}
        *Retiro en local*: ${pickup}
        *Método de pago*: ${paymentMethod}
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
