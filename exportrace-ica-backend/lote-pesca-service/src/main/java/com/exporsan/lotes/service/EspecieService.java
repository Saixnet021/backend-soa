package com.exporsan.lotes.service;

import com.exporsan.lotes.model.Especie;
import com.exporsan.lotes.repository.EspecieRepository;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class EspecieService {

    private final EspecieRepository especieRepository;

    public EspecieService(EspecieRepository especieRepository) {
        this.especieRepository = especieRepository;
    }

    public List<Especie> listarTodas() {
        return especieRepository.findAll();
    }

    public Especie obtenerPorId(Long id) {
        return especieRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Especie no encontrada con id: " + id));
    }

    public Especie actualizarVeda(Long id, Boolean enVeda) {
        Especie especie = obtenerPorId(id);
        especie.setEnVeda(enVeda);
        return especieRepository.save(especie);
    }
}
