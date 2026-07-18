package com.exporsan.auth.controller;

import com.exporsan.auth.dto.LoginRequest;
import com.exporsan.auth.dto.LoginResponse;
import com.exporsan.auth.dto.ValidateResponse;
import com.exporsan.auth.service.AuthService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(value = "/login", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getUsername(), request.getPassword());
            LoginResponse response = new LoginResponse("Bearer " + token, request.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("Error en login de usuario: " + e.getMessage());
            e.printStackTrace(System.out);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(value = "/validate", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<ValidateResponse> validate(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(new ValidateResponse(false, null, null));
        }
        String token = authHeader.substring(7);
        ValidateResponse response = authService.validate(token);
        return ResponseEntity.ok(response);
    }
}
