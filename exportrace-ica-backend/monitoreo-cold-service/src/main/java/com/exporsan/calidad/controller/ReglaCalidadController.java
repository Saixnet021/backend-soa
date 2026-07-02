package com.exporsan.calidad.controller;

import com.exporsan.audit.Auditable;
import com.exporsan.calidad.model.ReglaCalidad;
import com.exporsan.calidad.service.ReglaCalidadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/calidad/reglas")
public class ReglaCalidadController {

    private final ReglaCalidadService reglaCalidadService;

    public ReglaCalidadController(ReglaCalidadService reglaCalidadService) {
        this.reglaCalidadService = reglaCalidadService;
    }

    @GetMapping(produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<List<ReglaCalidad>> listarTodas() {
        return ResponseEntity.ok(reglaCalidadService.listarTodas());
    }

    @Auditable(accion = "CREAR_REGLA", entidad = "ReglaCalidad")
    @PostMapping(produces = {MediaType.APPLICATION_JSON_VALUE, "application/xml"})
    public ResponseEntity<ReglaCalidad> crearRegla(@RequestBody ReglaCalidad regla) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reglaCalidadService.crearRegla(regla));
    }
}
