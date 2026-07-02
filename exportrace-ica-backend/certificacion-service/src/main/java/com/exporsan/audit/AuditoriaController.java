package com.exporsan.audit;

import org.springframework.http.MediaType;
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
    public List<AuditoriaLog> listar() {
        return auditoriaLogRepository.findAllByOrderByTimestampDesc();
    }

    @GetMapping(value = "/entidad/{entidad}/{id}", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public List<AuditoriaLog> porEntidad(@PathVariable String entidad, @PathVariable String id) {
        return auditoriaLogRepository.findByEntidadAndEntidadIdOrderByTimestampDesc(entidad, id);
    }
}
