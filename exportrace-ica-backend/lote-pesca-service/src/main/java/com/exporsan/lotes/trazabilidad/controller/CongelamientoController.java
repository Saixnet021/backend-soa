package com.exporsan.lotes.trazabilidad.controller;

import com.exporsan.lotes.trazabilidad.dto.CongelamientoCamaraRequestDTO;
import com.exporsan.lotes.trazabilidad.dto.CongelamientoResponseDTO;
import com.exporsan.lotes.trazabilidad.dto.CongelamientoTunelRequestDTO;
import com.exporsan.lotes.trazabilidad.service.TrazabilidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/congelamiento")
@Tag(name = "Módulo 4: Congelamiento", description = "Endpoints para el congelamiento en túnel y almacenamiento en cámara")
public class CongelamientoController {

    private final TrazabilidadService trazabilidadService;

    public CongelamientoController(TrazabilidadService trazabilidadService) {
        this.trazabilidadService = trazabilidadService;
    }

    @PostMapping("/tunel")
    @PreAuthorize("hasRole('ROLE_PRODUCCION') or hasRole('ROLE_ADMIN')")
    @Operation(summary = "Registrar paso por túnel de congelamiento", description = "Permitido para PRODUCCION y ADMIN. Evalúa temperatura crítica (<= -18°C).")
    @ApiResponse(responseCode = "200", description = "Paso por túnel registrado exitosamente")
    public ResponseEntity<CongelamientoResponseDTO> registrarTunel(@Valid @RequestBody CongelamientoTunelRequestDTO dto) {
        CongelamientoResponseDTO response = trazabilidadService.registrarTunel(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/camara")
    @PreAuthorize("hasRole('ROLE_CALIDAD') or hasRole('ROLE_QA') or hasRole('ROLE_ADMIN')")
    @Operation(summary = "Registrar ingreso a cámara y control HACCP", description = "Permitido para QA/CALIDAD y ADMIN. Calcula fecha de vencimiento y estado final.")
    @ApiResponse(responseCode = "200", description = "Ingreso a cámara registrado exitosamente")
    public ResponseEntity<CongelamientoResponseDTO> registrarCamara(@Valid @RequestBody CongelamientoCamaraRequestDTO dto) {
        CongelamientoResponseDTO response = trazabilidadService.registrarCamara(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Listar todos los lotes en congelamiento/almacenamiento", description = "Lista los lotes registrados para usuarios autenticados")
    public ResponseEntity<List<CongelamientoResponseDTO>> listar() {
        List<CongelamientoResponseDTO> response = trazabilidadService.listarCongelamientos();
        return ResponseEntity.ok(response);
    }
}
