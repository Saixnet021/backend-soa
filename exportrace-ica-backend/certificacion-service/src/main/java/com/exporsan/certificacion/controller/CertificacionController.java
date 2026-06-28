package com.exporsan.certificacion.controller;

import com.exporsan.certificacion.dto.ExpedienteDTO;
import com.exporsan.certificacion.dto.TramiteSanipesDTO;
import com.exporsan.certificacion.service.CertificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orch")
public class CertificacionController {

    private final CertificacionService certificacionService;

    public CertificacionController(CertificacionService certificacionService) {
        this.certificacionService = certificacionService;
    }

    @PostMapping("/sanipes-check/{idLote}")
    public ResponseEntity<TramiteSanipesDTO> sanipesCheck(@PathVariable Long idLote) {
        TramiteSanipesDTO tramite = certificacionService.orquestarTramite(idLote);
        return ResponseEntity.ok(tramite);
    }

    @GetMapping("/expediente-certificado/{idLote}")
    public ResponseEntity<ExpedienteDTO> expedienteCertificado(@PathVariable Long idLote) {
        ExpedienteDTO expediente = certificacionService.obtenerExpediente(idLote);
        return ResponseEntity.ok(expediente);
    }
}
