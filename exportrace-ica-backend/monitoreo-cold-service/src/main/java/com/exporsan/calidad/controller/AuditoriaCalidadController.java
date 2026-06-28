package com.exporsan.calidad.controller;

import com.exporsan.calidad.dto.ResumenFrioDTO;
import com.exporsan.calidad.model.AuditoriaCalidad;
import com.exporsan.calidad.service.AuditoriaCalidadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/calidad")
public class AuditoriaCalidadController {

    private final AuditoriaCalidadService auditoriaCalidadService;

    public AuditoriaCalidadController(AuditoriaCalidadService auditoriaCalidadService) {
        this.auditoriaCalidadService = auditoriaCalidadService;
    }

    @PostMapping("/temperaturas")
    public ResponseEntity<AuditoriaCalidad> registrarTemperatura(@RequestBody AuditoriaCalidad auditoria) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auditoriaCalidadService.registrarTemperatura(auditoria));
    }

    @GetMapping("/temperaturas/lote/{idLote}")
    public ResponseEntity<List<AuditoriaCalidad>> listarPorLote(@PathVariable Long idLote) {
        return ResponseEntity.ok(auditoriaCalidadService.listarPorLote(idLote));
    }

    @GetMapping("/temperaturas/lote/{idLote}/resumen")
    public ResponseEntity<ResumenFrioDTO> obtenerResumenFrio(@PathVariable Long idLote) {
        return ResponseEntity.ok(auditoriaCalidadService.obtenerResumenFrio(idLote));
    }
}
