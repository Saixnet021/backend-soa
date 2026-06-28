package com.exporsan.lotes.controller;

import com.exporsan.lotes.model.Especie;
import com.exporsan.lotes.service.EspecieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/maestros/especies")
public class EspecieController {

    private final EspecieService especieService;

    public EspecieController(EspecieService especieService) {
        this.especieService = especieService;
    }

    @GetMapping
    public ResponseEntity<List<Especie>> listarTodas() {
        return ResponseEntity.ok(especieService.listarTodas());
    }

    @PutMapping("/{id}/edav")
    public ResponseEntity<Especie> actualizarVeda(@PathVariable Long id, @RequestParam Boolean enVeda) {
        return ResponseEntity.ok(especieService.actualizarVeda(id, enVeda));
    }
}
