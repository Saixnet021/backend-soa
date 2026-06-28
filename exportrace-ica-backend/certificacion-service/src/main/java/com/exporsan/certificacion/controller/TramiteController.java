package com.exporsan.certificacion.controller;

import com.exporsan.certificacion.dto.TramiteSanipesDTO;
import com.exporsan.certificacion.service.CertificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tramites")
public class TramiteController {

    private final CertificacionService certificacionService;

    public TramiteController(CertificacionService certificacionService) {
        this.certificacionService = certificacionService;
    }

    @GetMapping("/lote/{idLote}")
    public ResponseEntity<List<TramiteSanipesDTO>> listarTramitesPorLote(@PathVariable Long idLote) {
        List<TramiteSanipesDTO> tramites = certificacionService.listarTramitesPorLote(idLote);
        return ResponseEntity.ok(tramites);
    }
}
