package com.exporsan.calidad.service;

import com.exporsan.audit.Auditable;
import com.exporsan.calidad.dto.ResumenFrioDTO;
import com.exporsan.calidad.model.AuditoriaCalidad;
import com.exporsan.calidad.model.ReglaCalidad;
import com.exporsan.calidad.repository.AuditoriaCalidadRepository;
import com.exporsan.calidad.repository.ReglaCalidadRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.exporsan.lotes.service.LotePescaService;
import com.exporsan.lotes.model.LotePesca;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AuditoriaCalidadService {

    private final AuditoriaCalidadRepository auditoriaCalidadRepository;
    private final ReglaCalidadRepository reglaCalidadRepository;
    private final LotePescaService lotePescaService;

    @Value("${lote.service.url}")
    private String loteServiceUrl;

    public AuditoriaCalidadService(AuditoriaCalidadRepository auditoriaCalidadRepository,
                                   ReglaCalidadRepository reglaCalidadRepository,
                                   LotePescaService lotePescaService) {
        this.auditoriaCalidadRepository = auditoriaCalidadRepository;
        this.reglaCalidadRepository = reglaCalidadRepository;
        this.lotePescaService = lotePescaService;
    }

    @Auditable(accion = "REGISTRAR_TEMPERATURA", entidad = "AuditoriaCalidad")
    public AuditoriaCalidad registrarTemperatura(AuditoriaCalidad auditoria) {
        if (auditoria.getIdLote() == null) {
            throw new IllegalStateException("idLote es obligatorio");
        }

        if (auditoria.getTimestampMedicion() == null) {
            auditoria.setTimestampMedicion(LocalDateTime.now());
        }

        String codigoEspecie = null;
        try {
            LotePesca lote = lotePescaService.obtenerPorId(auditoria.getIdLote());
            if (lote != null) {
                codigoEspecie = lote.getEspecie();
            }
        } catch (Exception e) {
            // Continuar sin validar lote si el servicio no esta disponible
        }

        AuditoriaCalidad saved = auditoriaCalidadRepository.save(auditoria);

        if (codigoEspecie != null) {
            ReglaCalidad regla = reglaCalidadRepository.findByCodigoEspecie(codigoEspecie).orElse(null);
            if (regla != null) {
                Double temp = auditoria.getTemperaturaCelsius();
                String estado;
                if (temp < regla.getTempMinAlerta() - 5 || temp > regla.getTempMaxAlerta() + 5) {
                    estado = "RUPTURA";
                } else if (temp < regla.getTempMinAlerta() || temp > regla.getTempMaxAlerta()) {
                    estado = "ALERTA";
                } else {
                    estado = "OK";
                }
                try {
                    lotePescaService.actualizarEstadoCadenaFrio(auditoria.getIdLote(), estado);
                } catch (Exception e) {
                    // Ignorar si lote-service no esta disponible
                }
            }
        }

        return saved;
    }

    public List<AuditoriaCalidad> listarPorLote(Long idLote) {
        return auditoriaCalidadRepository.findByIdLoteOrderByTimestampMedicionDesc(idLote);
    }

    public List<AuditoriaCalidad> listarTodas() {
        return auditoriaCalidadRepository.findAll();
    }

    public ResumenFrioDTO obtenerResumenFrio(Long idLote) {
        List<AuditoriaCalidad> auditorias = auditoriaCalidadRepository.findByIdLoteOrderByTimestampMedicionDesc(idLote);

        if (auditorias.isEmpty()) {
            throw new EntityNotFoundException("No se encontraron auditorías para el lote: " + idLote);
        }

        double tempMin = auditorias.get(0).getTemperaturaCelsius();
        double tempMax = tempMin;
        double suma = 0;

        for (AuditoriaCalidad a : auditorias) {
            double temp = a.getTemperaturaCelsius();
            if (temp < tempMin) tempMin = temp;
            if (temp > tempMax) tempMax = temp;
            suma += temp;
        }

        double tempPromedio = suma / auditorias.size();

        LotePesca lote = null;
        try {
            lote = lotePescaService.obtenerPorId(idLote);
        } catch (Exception e) {
            // Continuar sin lote
        }

        boolean hayAlerta = false;
        String estadoCadenaFrio = "OK";

        if (lote != null) {
            String codigoEspecie = lote.getEspecie();
            ReglaCalidad regla = reglaCalidadRepository.findByCodigoEspecie(codigoEspecie).orElse(null);

            if (regla != null) {
                for (AuditoriaCalidad a : auditorias) {
                    double temp = a.getTemperaturaCelsius();
                    if (temp < regla.getTempMinAlerta() || temp > regla.getTempMaxAlerta()) {
                        hayAlerta = true;
                        estadoCadenaFrio = "ALERTA";
                        break;
                    }
                }

                if (hayAlerta) {
                    for (AuditoriaCalidad a : auditorias) {
                        double temp = a.getTemperaturaCelsius();
                        if (temp < regla.getTempMinAlerta() - 5 || temp > regla.getTempMaxAlerta() + 5) {
                            estadoCadenaFrio = "RUPTURA";
                            break;
                        }
                    }
                }
            }
        }

        return new ResumenFrioDTO(tempMin, tempMax, tempPromedio, hayAlerta, estadoCadenaFrio);
    }
}
