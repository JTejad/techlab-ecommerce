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
const formProducto = document.getElementById('form-producto');
const mensajeAdmin = document.getElementById('mensaje-admin');
const adminProductos = document.getElementById('admin-productos');
const productoCategoria = document.getElementById('producto-categoria');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
const btnGuardarProducto = document.getElementById('btn-guardar-producto');

let productos = [];
let categorias = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.getElementById('btn-recargar').addEventListener('click', () => cargarProductos());
document.getElementById('btn-vaciar').addEventListener('click', vaciarCarrito);
document.getElementById('btn-historial').addEventListener('click', cargarPedidos);
document.getElementById('form-pedido').addEventListener('submit', realizarPedido);
formProducto.addEventListener('submit', guardarProducto);
btnCancelarEdicion.addEventListener('click', limpiarFormularioProducto);
btnBuscar.addEventListener('click', buscarProductos);
btnLimpiarBusqueda.addEventListener('click', limpiarBusqueda);
busquedaProductos.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        buscarProductos();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
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

function cargarCategorias() {
    fetch(`${API_BASE}/categorias`)
        .then(validarRespuesta)
        .then(data => {
            categorias = data;
            renderCategorias();
        })
        .catch(error => {
            mostrarMensaje(mensajeAdmin, error.message);
        });
}

function renderCategorias() {
    productoCategoria.innerHTML = '<option value="">Seleccionar categoria</option>';

    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        productoCategoria.appendChild(option);
    });
}

function cargarProductos(nombre = '') {
    mostrarMensaje(mensajeProductos, '');
    productosGrid.innerHTML = '';
    actualizarEstadoSistema('Verificando...');

    const query = nombre ? `?nombre=${encodeURIComponent(nombre)}` : '';

    fetch(`${API_BASE}/productos${query}`)
        .then(validarRespuesta)
        .then(data => {
            productos = data;
            actualizarEstadoSistema('Disponible');
            renderProductos(data);
            renderAdminProductos(data);
        })
        .catch(error => {
            productos = [];
            actualizarEstadoSistema('Sin conexion');
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

function renderAdminProductos(lista) {
    adminProductos.innerHTML = '';

    if (lista.length === 0) {
        adminProductos.innerHTML = '<p class="estado-vacio">No hay productos cargados.</p>';
        return;
    }

    lista.forEach(producto => {
        const item = document.createElement('article');
        item.className = 'admin-item';
        item.innerHTML = `
            <div>
                <strong>#${producto.id} · ${producto.nombre}</strong>
                <span class="meta">${producto.categoria?.nombre || 'Sin categoria'} · $${producto.precio.toFixed(2)} · Stock ${producto.stock}</span>
            </div>
            <div class="admin-acciones">
                <button class="btn secundaria" type="button" data-accion="editar">Editar</button>
                <button class="btn texto peligro" type="button" data-accion="eliminar">Eliminar</button>
            </div>
        `;

        item.querySelector('[data-accion="editar"]').addEventListener('click', () => cargarProductoEnFormulario(producto));
        item.querySelector('[data-accion="eliminar"]').addEventListener('click', () => eliminarProducto(producto));
        adminProductos.appendChild(item);
    });
}

function cargarProductoEnFormulario(producto) {
    document.getElementById('producto-id').value = producto.id;
    document.getElementById('producto-nombre').value = producto.nombre;
    document.getElementById('producto-descripcion').value = producto.descripcion || '';
    document.getElementById('producto-precio').value = producto.precio;
    document.getElementById('producto-stock').value = producto.stock;
    document.getElementById('producto-imagen').value = producto.imagenUrl || '';
    productoCategoria.value = producto.categoria?.id || '';
    btnGuardarProducto.textContent = 'Actualizar producto';
    mostrarMensaje(mensajeAdmin, `Editando producto #${producto.id}.`, true);
}

function guardarProducto(event) {
    event.preventDefault();
    mostrarMensaje(mensajeAdmin, '');

    const id = document.getElementById('producto-id').value;
    const categoriaId = Number(productoCategoria.value);
    const categoriaSeleccionada = categorias.find(categoria => categoria.id === categoriaId);
    const producto = {
        nombre: document.getElementById('producto-nombre').value.trim(),
        descripcion: document.getElementById('producto-descripcion').value.trim(),
        precio: Number(document.getElementById('producto-precio').value),
        stock: Number(document.getElementById('producto-stock').value),
        imagenUrl: document.getElementById('producto-imagen').value.trim(),
        categoria: categoriaSeleccionada
    };

    const url = id ? `${API_BASE}/productos/${id}` : `${API_BASE}/productos`;
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    })
        .then(validarRespuesta)
        .then(() => {
            mostrarMensaje(mensajeAdmin, id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.', true);
            limpiarFormularioProducto(false);
            cargarProductos(busquedaProductos.value.trim());
        })
        .catch(error => {
            mostrarMensaje(mensajeAdmin, error.message);
        });
}

function eliminarProducto(producto) {
    const confirma = confirm(`Eliminar ${producto.nombre} del catalogo?`);

    if (!confirma) {
        return;
    }

    fetch(`${API_BASE}/productos/${producto.id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo eliminar el producto.');
            }
            mostrarMensaje(mensajeAdmin, 'Producto eliminado del catalogo.', true);
            cargarProductos(busquedaProductos.value.trim());
        })
        .catch(error => {
            mostrarMensaje(mensajeAdmin, error.message);
        });
}

function limpiarFormularioProducto(mostrarConfirmacion = true) {
    formProducto.reset();
    document.getElementById('producto-id').value = '';
    btnGuardarProducto.textContent = 'Guardar producto';

    if (mostrarConfirmacion) {
        mostrarMensaje(mensajeAdmin, 'Formulario limpio.', true);
    }
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

function actualizarEstadoSistema(texto) {
    apiStatus.textContent = texto;
}

function validarRespuesta(response) {
    if (!response.ok) {
        return response.json()
            .catch(() => ({}))
            .then(error => {
                throw new Error(error.error || 'Ocurrio un error al comunicarse con el sistema.');
            });
    }

    return response.json();
}
