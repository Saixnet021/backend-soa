package com.exporsan.auth.service;

import com.exporsan.audit.Auditable;
import com.exporsan.auth.dto.ValidateResponse;
import com.exporsan.auth.model.Usuario;
import com.exporsan.auth.repository.UsuarioRepository;
import com.exporsan.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Auditable(accion = "LOGIN", entidad = "Usuario")
    public String login(String username, String password) {
        Optional<Usuario> optionalUsuario = usuarioRepository.findByUsername(username);
        if (optionalUsuario.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Usuario usuario = optionalUsuario.get();
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        return jwtService.generarToken(usuario.getUsername(), usuario.getRol());
    }

    public ValidateResponse validate(String token) {
        if (jwtService.validarToken(token)) {
            String username = jwtService.extraerUsername(token);
            String rol = jwtService.extraerRol(token);
            return new ValidateResponse(true, username, rol);
        }
        return new ValidateResponse(false, null, null);
    }
}
