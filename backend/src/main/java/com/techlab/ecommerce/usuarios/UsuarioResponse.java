package com.techlab.ecommerce.usuarios;

public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String email;
    private boolean administrador;

    public UsuarioResponse(Usuario usuario) {
        this.id = usuario.getId();
        this.nombre = usuario.getNombre();
        this.email = usuario.getEmail();
        this.administrador = usuario.isAdministrador();
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getEmail() {
        return email;
    }

    public boolean isAdministrador() {
        return administrador;
    }
}
