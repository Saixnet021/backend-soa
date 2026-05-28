package com.exporsan.exportrace.service;

import com.exporsan.exportrace.dto.LoteCanonicoDTO;
import com.exporsan.exportrace.model.Especie;
import com.exporsan.exportrace.model.LotePesca;
import com.exporsan.exportrace.repository.EspecieRepository;
import com.exporsan.exportrace.repository.LotePescaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LotePescaService {

    private final LotePescaRepository lotePescaRepository;
    private final EspecieRepository especieRepository;
    private final ValidacionVedaService validacionVedaService;

    public LotePescaService(LotePescaRepository lotePescaRepository, EspecieRepository especieRepository, ValidacionVedaService validacionVedaService) {
        this.lotePescaRepository = lotePescaRepository;
        this.especieRepository = especieRepository;
        this.validacionVedaService = validacionVedaService;
    }

    public List<LoteCanonicoDTO> listarTodos() {
        return lotePescaRepository.findAll().stream()
                .map(this::mapToCanonicoDTO)
                .collect(Collectors.toList());
    }

    public LoteCanonicoDTO obtenerPorId(Long id) {
        LotePesca lote = lotePescaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado con id: " + id));
        return mapToCanonicoDTO(lote);
    }

    public LotePesca obtenerLoteEntidadPorId(Long id) {
        return lotePescaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado con id: " + id));
    }

    public LotePesca crearLote(LotePesca lote) {
        if (lote.getEspecie() == null || lote.getEspecie().getId() == null) {
            throw new IllegalStateException("El lote debe tener una especie asociada.");
        }
        
        Especie especie = especieRepository.findById(lote.getEspecie().getId())
                .orElseThrow(() -> new EntityNotFoundException("Especie no encontrada con id: " + lote.getEspecie().getId()));
        
        lote.setEspecie(especie);
        
        if (validacionVedaService.especieEnVeda(especie.getId())) {
            throw new IllegalStateException("No se puede registrar el lote: La especie '" + especie.getNombreComun() + "' se encuentra en veda.");
        }
        
        if (lote.getEstadoSanipes() == null) {
            lote.setEstadoSanipes("PENDIENTE");
        }
        if (lote.getEstadoFrio() == null) {
            lote.setEstadoFrio("OK");
        }
        if (lote.getEstadoGeneral() == null) {
            lote.setEstadoGeneral("PENDIENTE");
        }
        
        return lotePescaRepository.save(lote);
    }

    public LotePesca actualizarEstado(Long id, String estadoGeneral) {
        LotePesca lote = obtenerLoteEntidadPorId(id);
        lote.setEstadoGeneral(estadoGeneral);
        return lotePescaRepository.save(lote);
    }

    public LoteCanonicoDTO mapToCanonicoDTO(LotePesca lote) {
        LoteCanonicoDTO dto = new LoteCanonicoDTO();
        dto.setId(lote.getId());
        if (lote.getEspecie() != null) {
            dto.setEspecie(lote.getEspecie().getNombreComun());
            dto.setCodigoSanipesEspecie(lote.getEspecie().getCodigoSanipes());
        }
        dto.setEmbarcacion(lote.getEmbarcacion());
        dto.setPesoKg(lote.getPesoKg());
        dto.setFechaRecepcion(lote.getFechaRecepcion());
        dto.setEstadoSanipes(lote.getEstadoSanipes());
        dto.setEstadoFrio(lote.getEstadoFrio());
        dto.setEstadoGeneral(lote.getEstadoGeneral());
        return dto;
    }
}
