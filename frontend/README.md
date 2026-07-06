# Frontend

Interfaz web del e-commerce TechLab.

## Funcionalidades

- Consulta productos desde `GET /api/productos`.
- Busca productos por nombre.
- Muestra categoria, precio, descripcion, imagen y stock.
- Permite agregar productos al carrito usando `localStorage`.
- Permite realizar pedidos con `POST /api/pedidos`.
- Consulta historial de pedidos con `GET /api/pedidos`.
- Administra productos con alta, edicion y eliminacion desde la pantalla de administracion.
- Muestra mensajes de error devueltos por el backend.

## Uso

1. Levantar el backend desde `backend/`:

```bash
mvn spring-boot:run
```

2. Levantar el frontend:

```bash
cd frontend
python3 -m http.server 5500
```

3. Abrir `http://localhost:5500` en el navegador.

El backend acepta CORS desde cualquier origen durante el desarrollo.
