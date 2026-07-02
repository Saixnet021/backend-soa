package com.exporsan.registry.controller;

import com.exporsan.registry.model.ServiceEntry;
import com.exporsan.registry.service.RegistryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/registry")
public class RegistryController {

    @Autowired
    private RegistryService service;

    @PostMapping("/register")
    public ResponseEntity<ServiceEntry> register(@RequestBody ServiceEntry entry) {
        return ResponseEntity.ok(service.register(entry));
    }

    @DeleteMapping("/unregister/{serviceName}")
    public ResponseEntity<Void> unregister(@PathVariable String serviceName) {
        service.unregister(serviceName);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/heartbeat/{serviceName}")
    public ResponseEntity<Void> heartbeat(@PathVariable String serviceName) {
        service.heartbeat(serviceName);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<ServiceEntry>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{serviceName}")
    public ResponseEntity<?> findByName(@PathVariable String serviceName) {
        return service.findByName(serviceName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ServiceEntry>> findByCategory(@PathVariable String category) {
        return ResponseEntity.ok(service.findByCategory(category));
    }
}
