package com.exporsan.lotes.service;

import com.exporsan.audit.Auditable;
import com.exporsan.lotes.model.Especie;
import com.exporsan.lotes.model.LotePesca;
import com.exporsan.lotes.repository.EspecieRepository;
import com.exporsan.lotes.repository.LotePescaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LotePescaService {

    private final LotePescaRepository lotePescaRepository;
    private final EspecieRepository especieRepository;
    private final ExternalValidationService externalValidationService;

    public LotePescaService(LotePescaRepository lotePescaRepository,
                            EspecieRepository especieRepository,
                            ExternalValidationService externalValidationService) {
        this.lotePescaRepository = lotePescaRepository;
        this.especieRepository = especieRepository;
        this.externalValidationService = externalValidationService;
    }

    public List<LotePesca> listarTodos() {
        return lotePescaRepository.findAll();
    }

    public LotePesca obtenerPorId(Long id) {
        return lotePescaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado con id: " + id));
    }

    @Auditable(accion = "CREAR_LOTE", entidad = "LotePesca")
    public LotePesca crearLote(LotePesca lote) {
        Especie especie = especieRepository.findByNombreComunIgnoreCase(lote.getEspecie())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Especie no encontrada: " + lote.getEspecie()));

        if (externalValidationService.especieEnVeda(especie.getId())) {
            throw new IllegalStateException(
                    "La especie '" + lote.getEspecie() + "' se encuentra en veda. No se puede crear el lote.");
        }

        lote.setEstadoSanipes("PENDIENTE");
        lote.setEstadoCadenaFrio("OK");
        lote.setFechaRecepcion(LocalDateTime.now());
        return lotePescaRepository.save(lote);
    }

    @Auditable(accion = "ACTUALIZAR_ESTADO_SANIPES", entidad = "LotePesca")
    public LotePesca actualizarEstadoSanipes(Long id, String estadoSanipes) {
        LotePesca lote = obtenerPorId(id);
        lote.setEstadoSanipes(estadoSanipes);
        return lotePescaRepository.save(lote);
    }

    @Auditable(accion = "ACTUALIZAR_CADENA_FRIO", entidad = "LotePesca")
    public LotePesca actualizarEstadoCadenaFrio(Long id, String estado) {
        LotePesca lote = obtenerPorId(id);
        lote.setEstadoCadenaFrio(estado);
        return lotePescaRepository.save(lote);
    }

    public List<LotePesca> listarPorEspecieYEstado(String especie, String estado) {
        return lotePescaRepository.findByEspecieAndEstadoSanipes(especie, estado);
    }
}
