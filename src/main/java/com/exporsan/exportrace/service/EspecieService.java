package com.exporsan.exportrace.service;

import com.exporsan.exportrace.model.Especie;
import com.exporsan.exportrace.repository.EspecieRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
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

    public Especie crearEspecie(Especie especie) {
        return especieRepository.save(especie);
    }

    public Especie actualizarEspecie(Long id, Especie especieDetalles) {
        Especie especie = obtenerPorId(id);
        especie.setNombreComun(especieDetalles.getNombreComun());
        especie.setNombreCientifico(especieDetalles.getNombreCientifico());
        especie.setCodigoSanipes(especieDetalles.getCodigoSanipes());
        especie.setEnVeda(especieDetalles.getEnVeda());
        especie.setTempMinCritica(especieDetalles.getTempMinCritica());
        especie.setTempMaxCritica(especieDetalles.getTempMaxCritica());
        return especieRepository.save(especie);
    }

    public void eliminarEspecie(Long id) {
        Especie especie = obtenerPorId(id);
        especieRepository.delete(especie);
    }
}
