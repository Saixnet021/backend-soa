package com.exporsan.lotes.trazabilidad.controller;

import com.exporsan.lotes.trazabilidad.dto.ProcesamientoRequestDTO;
import com.exporsan.lotes.trazabilidad.dto.ProcesamientoResponseDTO;
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
@RequestMapping("/api/procesamiento")
@Tag(name = "Módulo 3: Procesamiento", description = "Endpoints para la sala de cortes y procesamiento")
public class ProcesamientoController {

    private final TrazabilidadService trazabilidadService;

    public ProcesamientoController(TrazabilidadService trazabilidadService) {
        this.trazabilidadService = trazabilidadService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_PRODUCCION') or hasRole('ROLE_ADMIN')")
    @Operation(summary = "Registrar un lote procesado en sala de cortes", description = "Permitido para PRODUCCION y ADMIN. Genera de forma segura el idLoteProduccion.")
    @ApiResponse(responseCode = "201", description = "Procesamiento registrado exitosamente")
    public ResponseEntity<ProcesamientoResponseDTO> registrar(@Valid @RequestBody ProcesamientoRequestDTO dto) {
        ProcesamientoResponseDTO response = trazabilidadService.registrarProcesamiento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Listar todos los procesamientos", description = "Lista todos los procesamientos para usuarios autenticados")
    public ResponseEntity<List<ProcesamientoResponseDTO>> listar() {
        List<ProcesamientoResponseDTO> response = trazabilidadService.listarProcesamientos();
        return ResponseEntity.ok(response);
    }
}
