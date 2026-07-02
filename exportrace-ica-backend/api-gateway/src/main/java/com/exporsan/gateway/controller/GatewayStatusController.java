package com.exporsan.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/gateway")
public class GatewayStatusController {

    private final Map<String, ServiceStatus> servicios = new LinkedHashMap<>();

    public GatewayStatusController() {
        servicios.put("auth-service", new ServiceStatus("auth-service", "http://localhost:8090"));
        servicios.put("lote-pesca-service", new ServiceStatus("lote-pesca-service", "http://localhost:8081"));
        servicios.put("monitoreo-cold-service", new ServiceStatus("monitoreo-cold-service", "http://localhost:8082"));
        servicios.put("certificacion-service", new ServiceStatus("certificacion-service", "http://localhost:8083"));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("gateway", "EXPORTRACE-ICA-GATEWAY");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("version", "1.0.0");
        response.put("servicios", servicios.values());
        response.put("totalServicios", servicios.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{servicio}")
    public ResponseEntity<?> statusServicio(@PathVariable String servicio) {
        ServiceStatus status = servicios.get(servicio);
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(status);
    }

    static class ServiceStatus {
        private String nombre;
        private String url;
        private String estado;
        private String ultimoHeartbeat;

        public ServiceStatus(String nombre, String url) {
            this.nombre = nombre;
            this.url = url;
            this.estado = "REGISTERED";
            this.ultimoHeartbeat = LocalDateTime.now().toString();
        }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }
        public String getUltimoHeartbeat() { return ultimoHeartbeat; }
        public void setUltimoHeartbeat(String ultimoHeartbeat) { this.ultimoHeartbeat = ultimoHeartbeat; }
    }
}
