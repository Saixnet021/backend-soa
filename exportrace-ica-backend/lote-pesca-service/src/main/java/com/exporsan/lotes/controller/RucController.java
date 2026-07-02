package com.exporsan.lotes.controller;

import com.exporsan.lotes.model.DecolectaRucResponse;
import com.exporsan.lotes.model.Empresa;
import com.exporsan.lotes.service.RucService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/consultas/ruc")
public class RucController {

    private final RucService rucService;

    public RucController(RucService rucService) {
        this.rucService = rucService;
    }

    @GetMapping(value = "/{numero}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DecolectaRucResponse> consultarRuc(@PathVariable String numero) {
        return ResponseEntity.ok(rucService.consultarRuc(numero));
    }

    @PostMapping(value = "/{numero}/registrar", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Empresa> registrarEmpresa(@PathVariable String numero) {
        Empresa empresa = rucService.buscarOCrearEmpresa(numero);
        return ResponseEntity.ok(empresa);
    }
}
