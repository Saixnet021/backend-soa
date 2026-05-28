package com.exporsan.exportrace.controller;

import com.exporsan.exportrace.model.Especie;
import com.exporsan.exportrace.service.EspecieService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/especies")
public class EspecieController {

    private final EspecieService especieService;

    public EspecieController(EspecieService especieService) {
        this.especieService = especieService;
    }

    @GetMapping
    public ResponseEntity<List<Especie>> listarTodas() {
        return ResponseEntity.ok(especieService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Especie> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(especieService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Especie> crearEspecie(@RequestBody Especie especie) {
        return ResponseEntity.status(HttpStatus.CREATED).body(especieService.crearEspecie(especie));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Especie> actualizarEspecie(@PathVariable Long id, @RequestBody Especie especie) {
        return ResponseEntity.ok(especieService.actualizarEspecie(id, especie));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEspecie(@PathVariable Long id) {
        especieService.eliminarEspecie(id);
        return ResponseEntity.noContent().build();
    }
}
