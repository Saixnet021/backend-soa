package com.exporsan.audit;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/auditoria")
public class AuditoriaController {

    private final AuditoriaLogRepository repository;

    public AuditoriaController(AuditoriaLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping(produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<List<AuditoriaLog>> listar() {
        return ResponseEntity.ok(repository.findAllByOrderByTimestampDesc());
    }

    @GetMapping(value = "/entidad/{entidad}/{id}", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<List<AuditoriaLog>> porEntidad(@PathVariable String entidad, @PathVariable String id) {
        return ResponseEntity.ok(repository.findByEntidadAndEntidadIdOrderByTimestampDesc(entidad, id));
    }
}
