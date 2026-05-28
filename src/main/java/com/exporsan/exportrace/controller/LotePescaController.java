package com.exporsan.exportrace.controller;

import com.exporsan.exportrace.dto.LoteCanonicoDTO;
import com.exporsan.exportrace.model.LotePesca;
import com.exporsan.exportrace.service.LotePescaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/adaptadores/sip/lotes")
public class LotePescaController {

    private final LotePescaService lotePescaService;

    public LotePescaController(LotePescaService lotePescaService) {
        this.lotePescaService = lotePescaService;
    }

    @GetMapping
    public ResponseEntity<List<LoteCanonicoDTO>> listarTodos() {
        return ResponseEntity.ok(lotePescaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoteCanonicoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(lotePescaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<LotePesca> crearLote(@RequestBody LotePesca lote) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lotePescaService.crearLote(lote));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<LotePesca> actualizarEstado(
            @PathVariable Long id, 
            @RequestParam String estadoGeneral) {
        return ResponseEntity.ok(lotePescaService.actualizarEstado(id, estadoGeneral));
    }
}
