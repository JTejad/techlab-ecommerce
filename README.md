# TechLab E-commerce

Sistema de gestion para un e-commerce desarrollado con Java, Spring Boot, JPA y frontend HTML/CSS/JavaScript.

## Estructura

- `backend/`: API REST con Java 17, Spring Boot, Spring Web, Spring Data JPA, H2 para pruebas rapidas y perfil MySQL.
- `frontend/`: interfaz web para consultar productos, gestionar carrito, crear pedidos, ver historial y administrar productos.

## Funcionalidades

- Gestion de productos: listar, buscar, crear, actualizar y eliminar.
- Gestion de categorias.
- Carrito de compras con `localStorage`.
- Creacion de pedidos con validacion de stock.
- Descuento automatico de stock al confirmar un pedido.
- Registro e inicio de sesion simple de usuarios.
- Historial de pedidos por email.
- Estados de pedido.
- Manejo de errores y excepcion personalizada para stock insuficiente.

## Como ejecutar

### Backend con H2

```bash
cd backend
mvn spring-boot:run
```

La aplicacion queda disponible en `http://localhost:8080`.

### Backend con MySQL

1. Crear la base de datos:

```sql
CREATE DATABASE techlab_ecommerce;
```

2. Configurar usuario y contrasena en `backend/src/main/resources/application-mysql.properties`.

3. Ejecutar con perfil MySQL:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

### Frontend

```bash
cd frontend
python3 -m http.server 5500
```

Abrir `http://localhost:5500` en el navegador.

## Endpoints principales

- `GET /api/productos`
- `GET /api/productos/{id}`
- `POST /api/productos`
- `PUT /api/productos/{id}`
- `DELETE /api/productos/{id}`
- `GET /api/categorias`
- `POST /api/categorias`
- `GET /api/pedidos`
- `POST /api/pedidos`
- `PUT /api/pedidos/{id}/estado?estado=PENDIENTE`
- `POST /api/usuarios/registro`
- `POST /api/usuarios/login`
