package com.exporsan.exportrace.service;

import com.exporsan.exportrace.model.AuditoriaCalidad;
import com.exporsan.exportrace.model.Especie;
import com.exporsan.exportrace.model.LotePesca;
import com.exporsan.exportrace.repository.AuditoriaCalidadRepository;
import com.exporsan.exportrace.repository.LotePescaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditoriaCalidadService {

    private final AuditoriaCalidadRepository auditoriaCalidadRepository;
    private final LotePescaRepository lotePescaRepository;

    public AuditoriaCalidadService(AuditoriaCalidadRepository auditoriaCalidadRepository, LotePescaRepository lotePescaRepository) {
        this.auditoriaCalidadRepository = auditoriaCalidadRepository;
        this.lotePescaRepository = lotePescaRepository;
    }

    @Transactional
    public AuditoriaCalidad registrarAuditoria(AuditoriaCalidad auditoria) {
        if (auditoria.getLote() == null || auditoria.getLote().getId() == null) {
            throw new IllegalStateException("La auditoría debe tener un lote asociado.");
        }
        
        LotePesca lote = lotePescaRepository.findById(auditoria.getLote().getId())
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado con id: " + auditoria.getLote().getId()));
        
        auditoria.setLote(lote);
        if (auditoria.getTimestampMedicion() == null) {
            auditoria.setTimestampMedicion(LocalDateTime.now());
        }
        
        Especie especie = lote.getEspecie();
        boolean dentro = true;
        if (especie != null && especie.getTempMinCritica() != null && especie.getTempMaxCritica() != null) {
            double temp = auditoria.getTemperaturaC();
            dentro = (temp >= especie.getTempMinCritica() && temp <= especie.getTempMaxCritica());
        }
        
        auditoria.setDentroRango(dentro);
        
        if (!dentro) {
            lote.setEstadoFrio("ALERTA");
        } else {
            lote.setEstadoFrio("OK");
        }
        lotePescaRepository.save(lote);
        
        return auditoriaCalidadRepository.save(auditoria);
    }

    public List<AuditoriaCalidad> listarPorLoteId(Long loteId) {
        if (!lotePescaRepository.existsById(loteId)) {
            throw new EntityNotFoundException("Lote no encontrado con id: " + loteId);
        }
        return auditoriaCalidadRepository.findByLoteId(loteId);
    }
}
