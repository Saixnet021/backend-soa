package com.exporsan.lotes.trazabilidad.controller;

import com.exporsan.lotes.trazabilidad.dto.RecepcionRequestDTO;
import com.exporsan.lotes.trazabilidad.dto.RecepcionResponseDTO;
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
@RequestMapping("/api/recepcion")
@Tag(name = "Módulo 1: Recepción", description = "Endpoints para el registro de materia prima en muelle")
public class RecepcionController {

    private final TrazabilidadService trazabilidadService;

    public RecepcionController(TrazabilidadService trazabilidadService) {
        this.trazabilidadService = trazabilidadService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_RECEPCION') or hasRole('ROLE_ADMIN')")
    @Operation(summary = "Registrar una nueva recepción de materia prima", description = "Permitido solo para rol RECEPCION y ADMIN")
    @ApiResponse(responseCode = "201", description = "Recepción creada exitosamente")
    public ResponseEntity<RecepcionResponseDTO> registrar(@Valid @RequestBody RecepcionRequestDTO dto) {
        RecepcionResponseDTO response = trazabilidadService.registrarRecepcion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Listar todas las recepciones", description = "Permite listar las recepciones a cualquier usuario autenticado")
    public ResponseEntity<List<RecepcionResponseDTO>> listar() {
        List<RecepcionResponseDTO> response = trazabilidadService.listarRecepciones();
        return ResponseEntity.ok(response);
    }
}
