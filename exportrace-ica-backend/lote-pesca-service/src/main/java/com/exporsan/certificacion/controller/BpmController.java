package com.exporsan.certificacion.controller;

import com.exporsan.certificacion.model.Notificacion;
import com.exporsan.certificacion.model.ProcesoNegocio;
import com.exporsan.certificacion.service.BpmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bpm")
public class BpmController {

    @Autowired
    private BpmService bpmService;

    @PostMapping("/iniciar")
    public ResponseEntity<ProcesoNegocio> iniciarProceso(@RequestBody Map<String, Object> body) {
        String tipoProceso = (String) body.get("tipoProceso");
        Long loteId = Long.valueOf(body.get("loteId").toString());
        Long usuarioId = body.get("usuarioId") != null ? Long.valueOf(body.get("usuarioId").toString()) : 1L;
        return ResponseEntity.ok(bpmService.iniciarProceso(tipoProceso, loteId, usuarioId));
    }

    @PutMapping("/{id}/avanzar")
    public ResponseEntity<ProcesoNegocio> avanzarProceso(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Long usuarioId = body.get("usuarioId") != null ? Long.valueOf(body.get("usuarioId")) : 1L;
        return ResponseEntity.ok(bpmService.avanzarProceso(id, body.get("estado"), body.get("subEstado"), usuarioId));
    }

    @PutMapping("/{id}/resultado")
    public ResponseEntity<ProcesoNegocio> registrarResultado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Long usuarioId = body.get("usuarioId") != null ? Long.valueOf(body.get("usuarioId")) : 1L;
        return ResponseEntity.ok(bpmService.registrarResultado(id, body.get("resultado"), usuarioId));
    }

    @PostMapping("/procesos/lote/{loteId}/avanzar")
    public ResponseEntity<ProcesoNegocio> avanzarPorLote(@PathVariable Long loteId, @RequestBody Map<String, String> body) {
        Long usuarioId = body.get("usuarioId") != null ? Long.valueOf(body.get("usuarioId")) : 1L;
        return ResponseEntity.ok(bpmService.avanzarProcesoPorLote(loteId, body.get("etapa"), body.get("subEstado"), body.get("observacion"), usuarioId));
    }
    public ResponseEntity<List<ProcesoNegocio>> listarProcesos() {
        return ResponseEntity.ok(bpmService.listarProcesos());
    }

    @GetMapping("/procesos/lote/{loteId}")
    public ResponseEntity<List<ProcesoNegocio>> porLote(@PathVariable Long loteId) {
        return ResponseEntity.ok(bpmService.porLote(loteId));
    }

    @GetMapping("/procesos/estado/{estado}")
    public ResponseEntity<List<ProcesoNegocio>> porEstado(@PathVariable String estado) {
        return ResponseEntity.ok(bpmService.porEstado(estado));
    }

    @GetMapping("/notificaciones")
    public ResponseEntity<List<Notificacion>> listarNotificaciones(
            @RequestParam(defaultValue = "1") Long usuarioId) {
        return ResponseEntity.ok(bpmService.listarNotificaciones(usuarioId));
    }

    @GetMapping("/notificaciones/todas")
    public ResponseEntity<List<Notificacion>> todasLasNotificaciones() {
        return ResponseEntity.ok(bpmService.todasLasNotificaciones());
    }

    @PutMapping("/notificaciones/{id}/leer")
    public ResponseEntity<Void> marcarLeida(@PathVariable Long id) {
        bpmService.marcarLeida(id);
        return ResponseEntity.ok().build();
    }
}
