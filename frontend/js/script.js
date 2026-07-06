const API_BASE = 'http://localhost:8080/api';

const productosGrid = document.getElementById('productos-grid');
const mensajeProductos = document.getElementById('mensaje-productos');
const carritoItems = document.getElementById('carrito-items');
const carritoTotal = document.getElementById('carrito-total');
const contadorCarrito = document.getElementById('contador-carrito');
const mensajePedido = document.getElementById('mensaje-pedido');
const pedidosLista = document.getElementById('pedidos-lista');

let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.getElementById('btn-recargar').addEventListener('click', cargarProductos);
document.getElementById('btn-vaciar').addEventListener('click', vaciarCarrito);
document.getElementById('btn-historial').addEventListener('click', cargarPedidos);
document.getElementById('form-pedido').addEventListener('submit', realizarPedido);

window.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    renderCarrito();
});

function cargarProductos() {
    mensajeProductos.textContent = '';
    productosGrid.innerHTML = '';

    fetch(`${API_BASE}/productos`)
        .then(validarRespuesta)
        .then(data => {
            productos = data;
            renderProductos(data);
        })
        .catch(error => {
            mensajeProductos.textContent = error.message;
        });
}

function renderProductos(lista) {
    if (lista.length === 0) {
        mensajeProductos.textContent = 'No hay productos disponibles.';
        return;
    }

    lista.forEach(producto => {
        const card = document.createElement('article');
        card.className = 'producto-card';
        card.innerHTML = `
            <img src="${producto.imagenUrl}" alt="${producto.nombre}">
            <div class="contenido">
                <p class="meta">${producto.categoria?.nombre || 'Sin categoria'} · Stock ${producto.stock}</p>
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p class="precio">$${producto.precio.toFixed(2)}</p>
                <button class="btn principal" data-id="${producto.id}" ${producto.stock <= 0 ? 'disabled' : ''}>Agregar al carrito</button>
            </div>
        `;

        card.querySelector('button').addEventListener('click', () => agregarAlCarrito(producto.id));
        productosGrid.appendChild(card);
    });
}

function agregarAlCarrito(productoId) {
    const producto = productos.find(item => item.id === productoId);
    if (!producto) {
        return;
    }

    const item = carrito.find(linea => linea.productoId === productoId);

    if (item) {
        if (item.cantidad >= producto.stock) {
            mensajePedido.textContent = 'No hay mas stock disponible para ese producto.';
            return;
        }
        item.cantidad++;
    } else {
        carrito.push({
            productoId: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            stock: producto.stock,
            cantidad: 1
        });
    }

    guardarCarrito();
    renderCarrito();
}

function renderCarrito() {
    carritoItems.innerHTML = '';

    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="meta">El carrito esta vacio.</p>';
    }

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        const div = document.createElement('div');
        div.className = 'carrito-item';
        div.innerHTML = `
            <strong>${item.nombre}</strong>
            <span class="meta">$${item.precio.toFixed(2)} x ${item.cantidad}</span>
            <div class="item-acciones">
                <span>Subtotal: $${subtotal.toFixed(2)}</span>
                <button class="btn secundaria" data-id="${item.productoId}">Eliminar</button>
            </div>
        `;

        div.querySelector('button').addEventListener('click', () => eliminarDelCarrito(item.productoId));
        carritoItems.appendChild(div);
    });

    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const cantidadTotal = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    carritoTotal.textContent = total.toFixed(2);
    contadorCarrito.textContent = cantidadTotal;
}

function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.productoId !== productoId);
    guardarCarrito();
    renderCarrito();
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    renderCarrito();
}

function realizarPedido(event) {
    event.preventDefault();
    mensajePedido.textContent = '';

    if (carrito.length === 0) {
        mensajePedido.textContent = 'Agrega productos antes de realizar el pedido.';
        return;
    }

    const pedido = {
        nombreCliente: document.getElementById('nombre-cliente').value,
        emailCliente: document.getElementById('email-cliente').value,
        lineas: carrito.map(item => ({
            productoId: item.productoId,
            cantidad: item.cantidad
        }))
    };

    fetch(`${API_BASE}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
    })
        .then(validarRespuesta)
        .then(data => {
            mensajePedido.textContent = `Pedido creado con ID ${data.id}. Total: $${data.total.toFixed(2)}`;
            vaciarCarrito();
            cargarProductos();
            cargarPedidos();
        })
        .catch(error => {
            mensajePedido.textContent = error.message;
        });
}

function cargarPedidos() {
    pedidosLista.innerHTML = '';
    const email = document.getElementById('email-cliente').value.trim();
    const url = email ? `${API_BASE}/pedidos?email=${encodeURIComponent(email)}` : `${API_BASE}/pedidos`;

    fetch(url)
        .then(validarRespuesta)
        .then(pedidos => renderPedidos(pedidos))
        .catch(error => {
            pedidosLista.innerHTML = `<p class="mensaje">${error.message}</p>`;
        });
}

function renderPedidos(pedidos) {
    if (pedidos.length === 0) {
        pedidosLista.innerHTML = '<p class="meta">No hay pedidos registrados.</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const div = document.createElement('article');
        div.className = 'pedido-card';
        div.innerHTML = `
            <h3>Pedido #${pedido.id}</h3>
            <p class="meta">${pedido.emailCliente} · ${pedido.estado}</p>
            <p>Total: $${pedido.total.toFixed(2)}</p>
            <p>Productos: ${pedido.lineas.length}</p>
        `;
        pedidosLista.appendChild(div);
    });
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function validarRespuesta(response) {
    if (!response.ok) {
        return response.json()
            .then(error => {
                throw new Error(error.error || 'Ocurrio un error al comunicarse con la API.');
            })
            .catch(() => {
                throw new Error('Ocurrio un error al comunicarse con la API.');
            });
    }

    return response.json();
}
