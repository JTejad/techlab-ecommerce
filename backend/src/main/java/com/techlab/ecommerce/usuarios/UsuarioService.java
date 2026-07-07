package com.techlab.ecommerce.usuarios;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.springframework.stereotype.Service;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario registrar(RegistroUsuarioRequest request) {
        validarRegistro(request);

        String emailNormalizado = request.getEmail().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(emailNormalizado)) {
            throw new IllegalArgumentException("Ya existe un usuario registrado con ese email.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        usuario.setEmail(emailNormalizado);
        usuario.setPasswordHash(hashearPassword(request.getPassword()));
        usuario.setAdministrador(false);
        return usuarioRepository.save(usuario);
    }

    public Usuario crearAdminInicial(String nombre, String email, String password) {
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            return usuarioRepository.findByEmailIgnoreCase(email).orElse(null);
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email.trim().toLowerCase());
        usuario.setPasswordHash(hashearPassword(password));
        usuario.setAdministrador(true);
        return usuarioRepository.save(usuario);
    }

    public Usuario login(LoginUsuarioRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email y contrasena son obligatorios.");
        }

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales invalidas."));

        if (!usuario.getPasswordHash().equals(hashearPassword(request.getPassword()))) {
            throw new IllegalArgumentException("Credenciales invalidas.");
        }

        return usuario;
    }

    private void validarRegistro(RegistroUsuarioRequest request) {
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio.");
        }
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("El email no es valido.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            throw new IllegalArgumentException("La contrasena debe tener al menos 4 caracteres.");
        }
    }

    private String hashearPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder resultado = new StringBuilder();

            for (byte b : hash) {
                resultado.append(String.format("%02x", b));
            }

            return resultado.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("No se pudo procesar la contrasena.", ex);
        }
    }
}
