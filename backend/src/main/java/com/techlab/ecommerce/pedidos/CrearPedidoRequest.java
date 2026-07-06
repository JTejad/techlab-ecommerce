package com.techlab.ecommerce.pedidos;

import java.util.List;

public class CrearPedidoRequest {
    private String nombreCliente;
    private String emailCliente;
    private List<CrearPedidoLineaRequest> lineas;

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public String getEmailCliente() {
        return emailCliente;
    }

    public void setEmailCliente(String emailCliente) {
        this.emailCliente = emailCliente;
    }

    public List<CrearPedidoLineaRequest> getLineas() {
        return lineas;
    }

    public void setLineas(List<CrearPedidoLineaRequest> lineas) {
        this.lineas = lineas;
    }
}
