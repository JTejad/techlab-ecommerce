const API_BASE = 'http://localhost:8080/api';

const productosGrid = document.getElementById('productos-grid');
const mensajeProductos = document.getElementById('mensaje-productos');
const carritoItems = document.getElementById('carrito-items');
const carritoTotal = document.getElementById('carrito-total');
const contadorCarrito = document.getElementById('contador-carrito');
const mensajePedido = document.getElementById('mensaje-pedido');
const pedidosLista = document.getElementById('pedidos-lista');
const apiStatus = document.getElementById('api-status');
const busquedaProductos = document.getElementById('busqueda-productos');
const btnBuscar = document.getElementById('btn-buscar');
const btnLimpiarBusqueda = document.getElementById('btn-limpiar-busqueda');

let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.getElementById('btn-recargar').addEventListener('click', () => cargarProductos());
document.getElementById('btn-vaciar').addEventListener('click', vaciarCarrito);
document.getElementById('btn-historial').addEventListener('click', cargarPedidos);
document.getElementById('form-pedido').addEventListener('submit', realizarPedido);
btnBuscar.addEventListener('click', buscarProductos);
btnLimpiarBusqueda.addEventListener('click', limpiarBusqueda);
busquedaProductos.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        buscarProductos();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    renderCarrito();
});

function buscarProductos() {
    cargarProductos(busquedaProductos.value.trim());
}

function limpiarBusqueda() {
    busquedaProductos.value = '';
    cargarProductos();
}

function cargarProductos(nombre = '') {
    mostrarMensaje(mensajeProductos, '');
    productosGrid.innerHTML = '';
    actualizarEstadoApi('Verificando...');

    const query = nombre ? `?nombre=${encodeURIComponent(nombre)}` : '';

    fetch(`${API_BASE}/productos${query}`)
        .then(validarRespuesta)
        .then(data => {
            productos = data;
            actualizarEstadoApi('En linea');
            renderProductos(data);
        })
        .catch(error => {
            productos = [];
            actualizarEstadoApi('Sin conexion');
            mostrarMensaje(mensajeProductos, error.message);
        });
}

function renderProductos(lista) {
    productosGrid.innerHTML = '';

    if (lista.length === 0) {
        mostrarMensaje(mensajeProductos, 'No hay productos disponibles para esa busqueda.');
        return;
    }

    lista.forEach(producto => {
        const card = document.createElement('article');
        const sinStock = producto.stock <= 0;
        const stockBajo = producto.stock > 0 && producto.stock <= 5;

        card.className = 'producto-card';
        card.innerHTML = `
            <img src="${producto.imagenUrl}" alt="${producto.nombre}">
            <div class="contenido">
                <p class="meta">${producto.categoria?.nombre || 'Sin categoria'} · <span class="${stockBajo ? 'stock-bajo' : 'stock'}">Stock ${producto.stock}</span></p>
                <h3>${producto.nombre}</h3>
                <p class="descripcion">${producto.descripcion || 'Producto disponible en catalogo.'}</p>
                <p class="precio">$${producto.precio.toFixed(2)}</p>
                <button class="btn principal" data-id="${producto.id}" ${sinStock ? 'disabled' : ''}>${sinStock ? 'Sin stock' : 'Agregar al carrito'}</button>
            </div>
        `;

        card.querySelector('button').addEventListener('click', () => agregarAlCarrito(producto.id));
        productosGrid.appendChild(card);
    });
}

function agregarAlCarrito(productoId) {
    mostrarMensaje(mensajePedido, '');

    const producto = productos.find(item => item.id === productoId);
    if (!producto) {
        return;
    }

    const item = carrito.find(linea => linea.productoId === productoId);

    if (item) {
        if (item.cantidad >= producto.stock) {
            mostrarMensaje(mensajePedido, 'No hay mas stock disponible para ese producto.');
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
    mostrarMensaje(mensajePedido, `${producto.nombre} agregado al carrito.`, true);
}

function renderCarrito() {
    carritoItems.innerHTML = '';

    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="carrito-vacio">El carrito esta vacio.</p>';
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

function vaciarCarrito(mostrarConfirmacion = true) {
    carrito = [];
    guardarCarrito();
    renderCarrito();

    if (mostrarConfirmacion) {
        mostrarMensaje(mensajePedido, 'Carrito vaciado.', true);
    }
}

function realizarPedido(event) {
    event.preventDefault();
    mostrarMensaje(mensajePedido, '');

    if (carrito.length === 0) {
        mostrarMensaje(mensajePedido, 'Agrega productos antes de realizar el pedido.');
        return;
    }

    const pedido = {
        nombreCliente: document.getElementById('nombre-cliente').value.trim(),
        emailCliente: document.getElementById('email-cliente').value.trim(),
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
            mostrarMensaje(mensajePedido, `Pedido creado con ID ${data.id}. Total: $${data.total.toFixed(2)}`, true);
            vaciarCarrito(false);
            cargarProductos(busquedaProductos.value.trim());
            cargarPedidos();
        })
        .catch(error => {
            mostrarMensaje(mensajePedido, error.message);
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
    pedidosLista.innerHTML = '';

    if (pedidos.length === 0) {
        pedidosLista.innerHTML = '<p class="estado-vacio">No hay pedidos registrados.</p>';
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

function mostrarMensaje(elemento, texto, ok = false) {
    elemento.textContent = texto;
    elemento.classList.toggle('ok', ok);
}

function actualizarEstadoApi(texto) {
    apiStatus.textContent = texto;
}

function validarRespuesta(response) {
    if (!response.ok) {
        return response.json()
            .catch(() => ({}))
            .then(error => {
                throw new Error(error.error || 'Ocurrio un error al comunicarse con la API.');
            });
    }

    return response.json();
}
