package com.exporsan.lotes.service;

import com.exporsan.lotes.model.DecolectaRucResponse;
import com.exporsan.lotes.model.Empresa;
import com.exporsan.lotes.repository.EmpresaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class RucService {

    private final RestTemplate restTemplate;
    private final EmpresaRepository empresaRepository;

    @Value("${decolecta.api.url:https://api.decolecta.com/v1}")
    private String apiUrl;

    @Value("${decolecta.api.token:sk_4441.RLFtFN7GuWekyCtN9kemz3SkcP1tOatt}")
    private String apiToken;

    public RucService(RestTemplate restTemplate, EmpresaRepository empresaRepository) {
        this.restTemplate = restTemplate;
        this.empresaRepository = empresaRepository;
    }

    public DecolectaRucResponse consultarRuc(String ruc) {
        if (ruc == null || ruc.length() != 11 || !ruc.matches("\\d{11}")) {
            throw new IllegalArgumentException("RUC invalido: debe tener 11 digitos numericos");
        }

        // Primero buscar en la DB local
        return empresaRepository.findByRuc(ruc)
                .map(empresa -> {
                    DecolectaRucResponse resp = new DecolectaRucResponse();
                    resp.setNumeroDocumento(empresa.getRuc());
                    resp.setRazonSocial(empresa.getRazonSocial());
                    resp.setDireccion(empresa.getDireccion());
                    resp.setEstado("ACTIVA".equals(empresa.getEstado()) ? "ACTIVO" : empresa.getEstado());
                    return resp;
                })
                .orElseGet(() -> {
                    // Si no existe localmente, consultar Decolecta API
                    String url = apiUrl + "/sunat/ruc/full?numero=" + ruc;
                    HttpHeaders headers = new HttpHeaders();
                    headers.set("Authorization", "Bearer " + apiToken);
                    HttpEntity<Void> entity = new HttpEntity<>(headers);
                    try {
                        return restTemplate.exchange(url, HttpMethod.GET, entity, DecolectaRucResponse.class).getBody();
                    } catch (Exception e) {
                        throw new RuntimeException("Error al consultar RUC en Decolecta: " + e.getMessage(), e);
                    }
                });
    }

    public Empresa buscarOCrearEmpresa(String ruc) {
        return empresaRepository.findByRuc(ruc)
                .orElseGet(() -> {
                    DecolectaRucResponse data = consultarRuc(ruc);
                    Empresa empresa = new Empresa();
                    empresa.setRuc(data.getNumeroDocumento());
                    empresa.setRazonSocial(data.getRazonSocial());
                    empresa.setDireccion(data.getDireccion());
                    empresa.setEstado("ACTIVO".equalsIgnoreCase(data.getEstado()) ? "ACTIVA" : data.getEstado());
                    return empresaRepository.save(empresa);
                });
    }
}
