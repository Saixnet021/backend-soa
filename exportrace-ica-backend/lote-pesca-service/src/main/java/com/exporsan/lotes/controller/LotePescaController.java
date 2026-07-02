package com.exporsan.lotes.controller;

import com.exporsan.lotes.model.LotePesca;
import com.exporsan.lotes.service.LotePescaService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/adaptadores/sip/lotes")
public class LotePescaController {

    private final LotePescaService lotePescaService;

    public LotePescaController(LotePescaService lotePescaService) {
        this.lotePescaService = lotePescaService;
    }

    @GetMapping(produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<List<LotePesca>> listarTodos() {
        return ResponseEntity.ok(lotePescaService.listarTodos());
    }

    @GetMapping(value = "/{id}", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<LotePesca> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(lotePescaService.obtenerPorId(id));
    }

    @PostMapping(produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<LotePesca> crearLote(@RequestBody LotePesca lote) {
        return ResponseEntity.ok(lotePescaService.crearLote(lote));
    }

    @PutMapping(value = "/{id}/estado-sanipes", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<LotePesca> actualizarEstadoSanipes(
            @PathVariable Long id,
            @RequestParam String estadoSanipes) {
        return ResponseEntity.ok(lotePescaService.actualizarEstadoSanipes(id, estadoSanipes));
    }

    @PutMapping(value = "/{id}/estado-cadena-frio", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<LotePesca> actualizarEstadoCadenaFrio(
            @PathVariable Long id,
            @RequestParam String estado) {
        return ResponseEntity.ok(lotePescaService.actualizarEstadoCadenaFrio(id, estado));
    }

    @PostMapping(value = "/{id}/fecha-salida", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<LotePesca> registrarFechaSalida(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        LocalDateTime fechaSalida = LocalDateTime.parse(body.get("fechaSalidaLote"));
        return ResponseEntity.ok(lotePescaService.registrarFechaSalida(id, fechaSalida));
    }

    @GetMapping(value = "/especie/{especie}/estado/{estadoSanipes}", produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<List<LotePesca>> listarPorEspecieYEstado(
            @PathVariable String especie,
            @PathVariable String estadoSanipes) {
        return ResponseEntity.ok(lotePescaService.listarPorEspecieYEstado(especie, estadoSanipes));
    }
}
