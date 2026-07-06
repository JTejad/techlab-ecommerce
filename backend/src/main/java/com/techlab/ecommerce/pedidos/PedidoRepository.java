package com.techlab.ecommerce.pedidos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByEmailClienteIgnoreCase(String emailCliente);
}
