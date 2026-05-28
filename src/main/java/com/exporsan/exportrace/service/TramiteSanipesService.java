package com.exporsan.exportrace.service;

import com.exporsan.exportrace.dto.TramiteSanipesDTO;
import com.exporsan.exportrace.model.LotePesca;
import com.exporsan.exportrace.model.TramiteSanipes;
import com.exporsan.exportrace.repository.LotePescaRepository;
import com.exporsan.exportrace.repository.TramiteSanipesRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TramiteSanipesService {

    private final TramiteSanipesRepository tramiteSanipesRepository;
    private final LotePescaRepository lotePescaRepository;

    public TramiteSanipesService(TramiteSanipesRepository tramiteSanipesRepository, LotePescaRepository lotePescaRepository) {
        this.tramiteSanipesRepository = tramiteSanipesRepository;
        this.lotePescaRepository = lotePescaRepository;
    }

    @Transactional
    public TramiteSanipesDTO solicitarTramite(Long idLote) {
        LotePesca lote = lotePescaRepository.findById(idLote)
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado con id: " + idLote));
        
        if (!"OK".equalsIgnoreCase(lote.getEstadoFrio())) {
            throw new IllegalStateException("No se puede iniciar trámite SANIPES: La cadena de frío no está en estado OK. Estado actual: " + lote.getEstadoFrio());
        }
        
        String codigoCertificado = UUID.randomUUID().toString();
        
        TramiteSanipes tramite = new TramiteSanipes();
        tramite.setLote(lote);
        tramite.setFechaSolicitud(LocalDateTime.now());
        tramite.setEstado("APROBADO");
        tramite.setCodigoCertificado(codigoCertificado);
        tramite.setUrlCertificado("https://sanipes.gob.pe/certificados/" + codigoCertificado);
        
        tramite = tramiteSanipesRepository.save(tramite);
        
        lote.setEstadoSanipes("APROBADO");
        lote.setEstadoGeneral("APTO");
        lotePescaRepository.save(lote);
        
        return mapToDTO(tramite);
    }

    public TramiteSanipesDTO obtenerTramitePorLoteId(Long loteId) {
        if (!lotePescaRepository.existsById(loteId)) {
            throw new EntityNotFoundException("Lote no encontrado con id: " + loteId);
        }
        
        TramiteSanipes tramite = tramiteSanipesRepository.findByLoteId(loteId)
                .orElseThrow(() -> new EntityNotFoundException("Trámite SANIPES no encontrado para el lote: " + loteId));
        
        return mapToDTO(tramite);
    }

    private TramiteSanipesDTO mapToDTO(TramiteSanipes tramite) {
        TramiteSanipesDTO dto = new TramiteSanipesDTO();
        dto.setId(tramite.getId());
        if (tramite.getLote() != null) {
            dto.setIdLote(tramite.getLote().getId());
        }
        dto.setEstado(tramite.getEstado());
        dto.setCodigoCertificado(tramite.getCodigoCertificado());
        dto.setUrlCertificado(tramite.getUrlCertificado());
        dto.setFechaSolicitud(tramite.getFechaSolicitud());
        return dto;
    }
}
