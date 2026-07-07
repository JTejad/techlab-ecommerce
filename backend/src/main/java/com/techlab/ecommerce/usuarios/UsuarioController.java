package com.techlab.ecommerce.usuarios;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(@RequestBody RegistroUsuarioRequest request) {
        Usuario usuario = usuarioService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new UsuarioResponse(usuario));
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponse> login(@RequestBody LoginUsuarioRequest request) {
        Usuario usuario = usuarioService.login(request);
        return ResponseEntity.ok(new UsuarioResponse(usuario));
    }
}
