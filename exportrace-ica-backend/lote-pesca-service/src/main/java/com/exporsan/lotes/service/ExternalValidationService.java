package com.exporsan.lotes.service;

import com.exporsan.lotes.model.Especie;
import com.exporsan.lotes.repository.EspecieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ExternalValidationService {

    @Value("${auth.service.url:http://localhost:8090}")
    private String authServiceUrl;

    private final EspecieRepository especieRepository;

    public ExternalValidationService(EspecieRepository especieRepository) {
        this.especieRepository = especieRepository;
    }

    public boolean especieEnVeda(Long especieId) {
        Especie especie = especieRepository.findById(especieId).orElse(null);
        if (especie == null) {
            return false;
        }
        return Boolean.TRUE.equals(especie.getEnVeda());
    }
}
