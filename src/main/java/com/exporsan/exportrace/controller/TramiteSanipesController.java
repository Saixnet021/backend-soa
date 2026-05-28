package com.exporsan.exportrace.controller;

import com.exporsan.exportrace.dto.LoteCanonicoDTO;
import com.exporsan.exportrace.dto.TramiteSanipesDTO;
import com.exporsan.exportrace.service.LotePescaService;
import com.exporsan.exportrace.service.TramiteSanipesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orch")
public class TramiteSanipesController {

    private final TramiteSanipesService tramiteSanipesService;
    private final LotePescaService lotePescaService;

    public TramiteSanipesController(TramiteSanipesService tramiteSanipesService, LotePescaService lotePescaService) {
        this.tramiteSanipesService = tramiteSanipesService;
        this.lotePescaService = lotePescaService;
    }

    @PostMapping("/sanipes-check/{idLote}")
    public ResponseEntity<TramiteSanipesDTO> solicitarTramite(@PathVariable Long idLote) {
        return ResponseEntity.ok(tramiteSanipesService.solicitarTramite(idLote));
    }

    @GetMapping("/expediente-certificado/{idLote}")
    public ResponseEntity<TramiteSanipesDTO> obtenerExpedienteCertificado(@PathVariable Long idLote) {
        return ResponseEntity.ok(tramiteSanipesService.obtenerTramitePorLoteId(idLote));
    }

    @GetMapping("/estado-integral/{idLote}")
    public ResponseEntity<LoteCanonicoDTO> obtenerEstadoIntegral(@PathVariable Long idLote) {
        return ResponseEntity.ok(lotePescaService.obtenerPorId(idLote));
    }
}
