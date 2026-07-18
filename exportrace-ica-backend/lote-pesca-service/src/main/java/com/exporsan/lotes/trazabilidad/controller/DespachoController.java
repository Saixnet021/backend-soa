package com.exporsan.lotes.trazabilidad.controller;

import com.exporsan.lotes.trazabilidad.dto.DespachoRequestDTO;
import com.exporsan.lotes.trazabilidad.dto.DespachoResponseDTO;
import com.exporsan.lotes.trazabilidad.dto.CongelamientoResponseDTO;
import com.exporsan.lotes.trazabilidad.dto.TrazabilidadCompletaDTO;
import com.exporsan.lotes.trazabilidad.service.PdfGeneratorService;
import com.exporsan.lotes.trazabilidad.service.TrazabilidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/despacho")
@Tag(name = "Módulo 5: Despacho", description = "Endpoints para el despacho y exportación (SANIPES) de lotes listos")
public class DespachoController {

    private final TrazabilidadService trazabilidadService;
    private final PdfGeneratorService pdfGeneratorService;

    public DespachoController(TrazabilidadService trazabilidadService, PdfGeneratorService pdfGeneratorService) {
        this.trazabilidadService = trazabilidadService;
        this.pdfGeneratorService = pdfGeneratorService;
    }

    @GetMapping("/disponibles")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Listar lotes listos para despacho (FIFO)", description = "Devuelve lotes congelados aptos para exportación ordenados por fecha de ingreso a cámara.")
    public ResponseEntity<List<CongelamientoResponseDTO>> listarDisponibles() {
        List<CongelamientoResponseDTO> response = trazabilidadService.listarDisponiblesDespacho();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_LOGISTICA') or hasRole('ROLE_ADMIN')")
    @Operation(summary = "Registrar un despacho de exportación", description = "Permitido para LOGISTICA y ADMIN. Descuenta automáticamente el stock al transitar.")
    @ApiResponse(responseCode = "201", description = "Despacho registrado con éxito")
    public ResponseEntity<DespachoResponseDTO> registrar(@Valid @RequestBody DespachoRequestDTO dto) {
        DespachoResponseDTO response = trazabilidadService.registrarDespacho(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{loteId}/trazabilidad")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener trazabilidad completa de un lote", description = "Devuelve el historial end-to-end desde muelle hasta despacho")
    public ResponseEntity<TrazabilidadCompletaDTO> obtenerTrazabilidad(@PathVariable Long loteId) {
        TrazabilidadCompletaDTO response = trazabilidadService.obtenerTrazabilidadCompleta(loteId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{despachoId}/pdf/packing-list")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Descargar Packing List en formato PDF", description = "Genera el Packing List Comercial usando OpenPDF")
    public ResponseEntity<byte[]> descargarPackingList(@PathVariable Long despachoId) {
        DespachoResponseDTO despacho = trazabilidadService.obtenerDespachoPorId(despachoId);
        byte[] pdfBytes = pdfGeneratorService.generatePackingList(despacho);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=packing-list-" + despachoId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/{despachoId}/pdf/guia-remision")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Descargar Guía de Remisión en formato PDF", description = "Genera la Guía de Remisión Remitente usando OpenPDF")
    public ResponseEntity<byte[]> descargarGuiaRemision(@PathVariable Long despachoId) {
        DespachoResponseDTO despacho = trazabilidadService.obtenerDespachoPorId(despachoId);
        byte[] pdfBytes = pdfGeneratorService.generateGuiaRemision(despacho);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=guia-remision-" + despachoId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
