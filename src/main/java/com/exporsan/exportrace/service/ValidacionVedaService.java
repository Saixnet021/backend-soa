package com.exporsan.exportrace.service;

import com.exporsan.exportrace.model.Especie;
import com.exporsan.exportrace.repository.EspecieRepository;
import org.springframework.stereotype.Service;

@Service
public class ValidacionVedaService {

    private final EspecieRepository especieRepository;

    public ValidacionVedaService(EspecieRepository especieRepository) {
        this.especieRepository = especieRepository;
    }

    public boolean especieEnVeda(Long especieId) {
        return especieRepository.findById(especieId)
                .map(Especie::getEnVeda)
                .orElse(false);
    }
}
