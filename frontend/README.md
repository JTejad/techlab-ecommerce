# Frontend

Interfaz web del e-commerce TechLab.

## Funcionalidades

- consulta productos desde `GET /api/productos`
- muestra categoria, precio, descripcion, imagen y stock
- permite agregar productos al carrito usando `localStorage`
- permite realizar pedidos con `POST /api/pedidos`
- consulta historial de pedidos con `GET /api/pedidos`
- muestra mensajes de error devueltos por la API

## Uso

1. Levantar el backend desde `backend/`:

```bash
mvn spring-boot:run
```

2. Abrir `frontend/index.html` en el navegador.

Si se usa Live Server, el backend ya acepta CORS desde cualquier origen durante el desarrollo.
