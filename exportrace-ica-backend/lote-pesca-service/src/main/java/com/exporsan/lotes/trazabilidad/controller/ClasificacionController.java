package com.exporsan.lotes.trazabilidad.controller;

import com.exporsan.lotes.trazabilidad.dto.ClasificacionRequestDTO;
import com.exporsan.lotes.trazabilidad.dto.ClasificacionResponseDTO;
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
@RequestMapping("/api/clasificacion")
@Tag(name = "Módulo 2: Clasificación", description = "Endpoints para la clasificación e inspección de calidad")
public class ClasificacionController {

    private final TrazabilidadService trazabilidadService;

    public ClasificacionController(TrazabilidadService trazabilidadService) {
        this.trazabilidadService = trazabilidadService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_CALIDAD') or hasRole('ROLE_QA') or hasRole('ROLE_ADMIN')")
    @Operation(summary = "Registrar una nueva clasificación de calidad", description = "Permitido para QA/CALIDAD y ADMIN. Realiza cálculos automáticos de peso útil.")
    @ApiResponse(responseCode = "201", description = "Clasificación registrada exitosamente")
    public ResponseEntity<ClasificacionResponseDTO> registrar(@Valid @RequestBody ClasificacionRequestDTO dto) {
        ClasificacionResponseDTO response = trazabilidadService.registrarClasificacion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Listar clasificaciones", description = "Lista clasificaciones. Por defecto excluye RECHAZADO_TOTAL a menos que incluirRechazados sea true.")
    public ResponseEntity<List<ClasificacionResponseDTO>> listar(
            @RequestParam(defaultValue = "false") boolean incluirRechazados) {
        List<ClasificacionResponseDTO> response = trazabilidadService.listarClasificaciones(incluirRechazados);
        return ResponseEntity.ok(response);
    }
}
