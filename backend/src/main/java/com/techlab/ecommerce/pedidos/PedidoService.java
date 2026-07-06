package com.techlab.ecommerce.pedidos;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.techlab.ecommerce.productos.Producto;
import com.techlab.ecommerce.productos.ProductoRepository;

@Service
public class PedidoService {
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    public List<Pedido> listarPorEmail(String email) {
        return pedidoRepository.findByEmailClienteIgnoreCase(email);
    }

    public Pedido obtenerPorId(Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }

    @Transactional
    public Pedido crearPedido(CrearPedidoRequest request) {
        validarRequest(request);

        Pedido pedido = new Pedido();
        pedido.setNombreCliente(request.getNombreCliente());
        pedido.setEmailCliente(request.getEmailCliente());
        pedido.setEstado(EstadoPedido.PENDIENTE);

        double total = 0;

        for (CrearPedidoLineaRequest lineaRequest : request.getLineas()) {
            if (lineaRequest.getCantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor a cero.");
            }

            Producto producto = productoRepository.findById(lineaRequest.getProductoId())
                    .filter(Producto::isActivo)
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + lineaRequest.getProductoId()));

            producto.descontarStock(lineaRequest.getCantidad());
            productoRepository.save(producto);

            LineaPedido linea = new LineaPedido();
            linea.setProducto(producto);
            linea.setCantidad(lineaRequest.getCantidad());
            linea.setPrecioUnitario(producto.getPrecio());
            linea.setSubtotal(producto.getPrecio() * lineaRequest.getCantidad());

            pedido.agregarLinea(linea);
            total += linea.getSubtotal();
        }

        pedido.setTotal(total);
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido actualizarEstado(Long id, EstadoPedido estado) {
        Pedido pedido = obtenerPorId(id);

        if (pedido == null) {
            return null;
        }

        pedido.setEstado(estado);
        return pedidoRepository.save(pedido);
    }

    private void validarRequest(CrearPedidoRequest request) {
        if (request.getNombreCliente() == null || request.getNombreCliente().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del cliente es obligatorio.");
        }
        if (request.getEmailCliente() == null || !request.getEmailCliente().contains("@")) {
            throw new IllegalArgumentException("El email del cliente no es valido.");
        }
        if (request.getLineas() == null || request.getLineas().isEmpty()) {
            throw new IllegalArgumentException("El pedido debe tener al menos un producto.");
        }
    }
}
