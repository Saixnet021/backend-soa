package com.exporsan.audit;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auditoria")
public class AuditoriaController {

    private final AuditoriaLogRepository auditoriaLogRepository;

    public AuditoriaController(AuditoriaLogRepository auditoriaLogRepository) {
        this.auditoriaLogRepository = auditoriaLogRepository;
    }

    @GetMapping(produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<List<AuditoriaLog>> listarTodas() {
        return ResponseEntity.ok(auditoriaLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping(value = "/entidad/{entidad}/{id}", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<List<AuditoriaLog>> buscarPorEntidad(@PathVariable String entidad, @PathVariable String id) {
        return ResponseEntity.ok(auditoriaLogRepository.findByEntidadAndEntidadIdOrderByTimestampDesc(entidad, id));
    }
}
