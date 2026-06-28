package com.exporsan.calidad.service;

import com.exporsan.calidad.dto.ResumenFrioDTO;
import com.exporsan.calidad.model.AuditoriaCalidad;
import com.exporsan.calidad.model.ReglaCalidad;
import com.exporsan.calidad.repository.AuditoriaCalidadRepository;
import com.exporsan.calidad.repository.ReglaCalidadRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AuditoriaCalidadService {

    private final AuditoriaCalidadRepository auditoriaCalidadRepository;
    private final ReglaCalidadRepository reglaCalidadRepository;
    private final RestTemplate restTemplate;

    @Value("${lote.service.url}")
    private String loteServiceUrl;

    public AuditoriaCalidadService(AuditoriaCalidadRepository auditoriaCalidadRepository,
                                   ReglaCalidadRepository reglaCalidadRepository,
                                   RestTemplate restTemplate) {
        this.auditoriaCalidadRepository = auditoriaCalidadRepository;
        this.reglaCalidadRepository = reglaCalidadRepository;
        this.restTemplate = restTemplate;
    }

    @SuppressWarnings("unchecked")
    public AuditoriaCalidad registrarTemperatura(AuditoriaCalidad auditoria) {
        if (auditoria.getIdLote() == null) {
            throw new IllegalStateException("idLote es obligatorio");
        }

        if (auditoria.getTimestampMedicion() == null) {
            auditoria.setTimestampMedicion(LocalDateTime.now());
        }

        Map<String, Object> lote = restTemplate.getForObject(
                loteServiceUrl + "/api/v1/adaptadores/sip/lotes/" + auditoria.getIdLote(),
                Map.class
        );

        if (lote == null) {
            throw new EntityNotFoundException("Lote no encontrado: " + auditoria.getIdLote());
        }

        String codigoEspecie = (String) lote.get("especie");

        ReglaCalidad regla = reglaCalidadRepository.findByCodigoEspecie(codigoEspecie)
                .orElse(null);

        AuditoriaCalidad saved = auditoriaCalidadRepository.save(auditoria);

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

            restTemplate.put(
                    loteServiceUrl + "/api/v1/adaptadores/sip/lotes/" + auditoria.getIdLote() + "/estado-cadena-frio?estado=" + estado,
                    null
            );
        }

        return saved;
    }

    public List<AuditoriaCalidad> listarPorLote(Long idLote) {
        return auditoriaCalidadRepository.findByIdLoteOrderByTimestampMedicionDesc(idLote);
    }

    @SuppressWarnings("unchecked")
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

        Map<String, Object> lote = restTemplate.getForObject(
                loteServiceUrl + "/api/v1/adaptadores/sip/lotes/" + idLote,
                Map.class
        );

        boolean hayAlerta = false;
        String estadoCadenaFrio = "OK";

        if (lote != null) {
            String codigoEspecie = (String) lote.get("especie");
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
