package com.exporsan.auth;

import com.exporsan.auth.model.Usuario;
import com.exporsan.auth.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        System.out.println("DataInitializer: Sincronizando usuarios por defecto...");
        
        upsertUsuario("admin", "admin123", "ADMIN");
        upsertUsuario("calidad", "calidad123", "QA");
        upsertUsuario("logistica", "logistica123", "LOGISTICA");
        upsertUsuario("root", "root", "ADMIN");
        
        System.out.println("DataInitializer: Sincronizacion de usuarios completada. Total usuarios en DB = " + usuarioRepository.count());
    }

    private void upsertUsuario(String username, String rawPassword, String rol) {
        usuarioRepository.findByUsername(username).ifPresentOrElse(
            usuario -> {
                usuario.setPassword(passwordEncoder.encode(rawPassword));
                usuario.setRol(rol);
                usuarioRepository.save(usuario);
                System.out.println("DataInitializer: Usuario '" + username + "' actualizado con credenciales por defecto.");
            },
            () -> {
                usuarioRepository.save(new Usuario(username, passwordEncoder.encode(rawPassword), rol));
                System.out.println("DataInitializer: Usuario '" + username + "' creado de cero.");
            }
        );
    }
}
