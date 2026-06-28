package com.exporsan.lotes.controller;

import com.exporsan.lotes.model.LotePesca;
import com.exporsan.lotes.service.LotePescaService;
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
    public ResponseEntity<List<LotePesca>> listarTodos() {
        return ResponseEntity.ok(lotePescaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LotePesca> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(lotePescaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<LotePesca> crearLote(@RequestBody LotePesca lote) {
        return ResponseEntity.ok(lotePescaService.crearLote(lote));
    }

    @PutMapping("/{id}/estado-sanipes")
    public ResponseEntity<LotePesca> actualizarEstadoSanipes(
            @PathVariable Long id,
            @RequestParam String estadoSanipes) {
        return ResponseEntity.ok(lotePescaService.actualizarEstadoSanipes(id, estadoSanipes));
    }

    @PutMapping("/{id}/estado-cadena-frio")
    public ResponseEntity<LotePesca> actualizarEstadoCadenaFrio(
            @PathVariable Long id,
            @RequestParam String estado) {
        return ResponseEntity.ok(lotePescaService.actualizarEstadoCadenaFrio(id, estado));
    }

    @GetMapping("/especie/{especie}/estado/{estadoSanipes}")
    public ResponseEntity<List<LotePesca>> listarPorEspecieYEstado(
            @PathVariable String especie,
            @PathVariable String estadoSanipes) {
        return ResponseEntity.ok(lotePescaService.listarPorEspecieYEstado(especie, estadoSanipes));
    }
}
