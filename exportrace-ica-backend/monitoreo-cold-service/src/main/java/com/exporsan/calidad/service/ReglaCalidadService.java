package com.exporsan.calidad.service;

import com.exporsan.calidad.model.ReglaCalidad;
import com.exporsan.calidad.repository.ReglaCalidadRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReglaCalidadService {

    private final ReglaCalidadRepository reglaCalidadRepository;

    public ReglaCalidadService(ReglaCalidadRepository reglaCalidadRepository) {
        this.reglaCalidadRepository = reglaCalidadRepository;
    }

    public List<ReglaCalidad> listarTodas() {
        return reglaCalidadRepository.findAll();
    }

    public ReglaCalidad crearRegla(ReglaCalidad regla) {
        return reglaCalidadRepository.save(regla);
    }
}
