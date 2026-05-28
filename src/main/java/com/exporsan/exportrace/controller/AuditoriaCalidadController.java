package com.exporsan.exportrace.controller;

import com.exporsan.exportrace.model.AuditoriaCalidad;
import com.exporsan.exportrace.service.AuditoriaCalidadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/auditorias")
public class AuditoriaCalidadController {

    private final AuditoriaCalidadService auditoriaCalidadService;

    public AuditoriaCalidadController(AuditoriaCalidadService auditoriaCalidadService) {
        this.auditoriaCalidadService = auditoriaCalidadService;
    }

    @PostMapping
    public ResponseEntity<AuditoriaCalidad> registrarAuditoria(@RequestBody AuditoriaCalidad auditoria) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auditoriaCalidadService.registrarAuditoria(auditoria));
    }

    @GetMapping("/lote/{idLote}")
    public ResponseEntity<List<AuditoriaCalidad>> listarPorLoteId(@PathVariable Long idLote) {
        return ResponseEntity.ok(auditoriaCalidadService.listarPorLoteId(idLote));
    }
}
