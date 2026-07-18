package com.exporsan.certificacion.service;

import com.exporsan.audit.Auditable;
import com.exporsan.certificacion.dto.*;
import com.exporsan.certificacion.model.TramiteSanipes;
import com.exporsan.certificacion.repository.TramiteSanipesRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class CertificacionService {

    private final TramiteSanipesRepository tramiteSanipesRepository;
    private final RestTemplate restTemplate;

    @Value("${lote.service.url}")
    private String loteServiceUrl;

    @Value("${calidad.service.url}")
    private String calidadServiceUrl;

    public CertificacionService(TramiteSanipesRepository tramiteSanipesRepository, RestTemplate restTemplate) {
        this.tramiteSanipesRepository = tramiteSanipesRepository;
        this.restTemplate = restTemplate;
    }

    @Auditable(accion = "SOLICITAR_CERTIFICADO", entidad = "TramiteSanipes")
    public TramiteSanipesDTO orquestarTramite(Long idLote) {
        LoteDTO lote;
        try {
            lote = restTemplate.getForObject(
                    loteServiceUrl + "/api/v1/adaptadores/sip/lotes/" + idLote,
                    LoteDTO.class
            );
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo obtener la información del lote. Verifique que el servicio de lotes esté activo.");
        }

        ResumenFrioDTO resumenFrio;
        try {
            resumenFrio = restTemplate.getForObject(
                    calidadServiceUrl + "/api/v1/calidad/temperaturas/lote/" + idLote + "/resumen",
                    ResumenFrioDTO.class
            );
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new IllegalStateException("No se puede solicitar el certificado porque no se han registrado mediciones de temperatura para este lote.");
            }
            throw new IllegalStateException("Error al verificar la cadena de frío del lote: " + ex.getResponseBodyAsString());
        } catch (Exception ex) {
            throw new IllegalStateException("El servicio de monitoreo de frío no se encuentra disponible.");
        }

        if (resumenFrio == null || !"OK".equals(resumenFrio.getEstadoCadenaFrio())) {
            throw new IllegalStateException("La cadena de frío no está en estado OK para el lote " + idLote);
        }

        if (lote == null || lote.getPesoKg() == null || lote.getPesoKg() <= 0) {
            throw new IllegalStateException("El peso del lote " + idLote + " es inválido");
        }
//... (keep original rest of orquestarTramite)
        String numeroCertificado = "CERT-" + Year.now().getValue() + "-" + idLote + "-" +
                String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

        TramiteSanipes tramite = new TramiteSanipes();
        tramite.setIdLote(idLote);
        tramite.setFechaSolicitud(LocalDateTime.now());
        tramite.setEstadoTramite("APROBADO");
        tramite.setNumeroCertificado(numeroCertificado);
        tramite.setFechaAprobacion(LocalDateTime.now());

        tramiteSanipesRepository.save(tramite);

        restTemplate.put(
                loteServiceUrl + "/api/v1/adaptadores/sip/lotes/" + idLote + "/estado-sanipes?estadoSanipes=APROBADO",
                null
        );

        TramiteSanipesDTO dto = new TramiteSanipesDTO();
        dto.setIdTramite(tramite.getId());
        dto.setEstadoTramite(tramite.getEstadoTramite());
        dto.setNumeroCertificado(tramite.getNumeroCertificado());
        dto.setIdLote(tramite.getIdLote());

        return dto;
    }

    @Auditable(accion = "GENERAR_EXPEDIENTE", entidad = "ExpedienteCertificado")
    public ExpedienteDTO obtenerExpediente(Long idLote) {
        LoteDTO lote = null;
        try {
            lote = restTemplate.getForObject(
                    loteServiceUrl + "/api/v1/adaptadores/sip/lotes/" + idLote,
                    LoteDTO.class
            );
        } catch (Exception ex) {
            // No bloquear
        }

        ResumenFrioDTO resumenFrio = null;
        try {
            resumenFrio = restTemplate.getForObject(
                    calidadServiceUrl + "/api/v1/calidad/temperaturas/lote/" + idLote + "/resumen",
                    ResumenFrioDTO.class
            );
        } catch (Exception ex) {
            // No bloquear
        }

        List<TramiteSanipes> tramites = tramiteSanipesRepository.findByIdLote(idLote);
        TramiteSanipes ultimoTramite = tramites.stream()
                .max(Comparator.comparing(TramiteSanipes::getFechaSolicitud))
                .orElse(null);

        TramiteSanipesDTO tramiteDTO = null;
        String numeroCertificado = null;
        if (ultimoTramite != null) {
            tramiteDTO = new TramiteSanipesDTO();
            tramiteDTO.setIdTramite(ultimoTramite.getId());
            tramiteDTO.setEstadoTramite(ultimoTramite.getEstadoTramite());
            tramiteDTO.setNumeroCertificado(ultimoTramite.getNumeroCertificado());
            tramiteDTO.setIdLote(ultimoTramite.getIdLote());
            numeroCertificado = ultimoTramite.getNumeroCertificado();
        }

        ExpedienteDTO expediente = new ExpedienteDTO();
        expediente.setLote(lote);
        expediente.setResumenFrio(resumenFrio);
        expediente.setTramite(tramiteDTO);

        if (numeroCertificado != null) {
            expediente.setQrData("https://exportrace.ica/certificado/" + numeroCertificado);
        }

        if (lote != null && lote.getFechaSalidaLote() != null) {
            expediente.setFechaSalidaLote(lote.getFechaSalidaLote());
            if (lote.getFechaRecepcion() != null) {
                try {
                    LocalDateTime recepcion = LocalDateTime.parse(lote.getFechaRecepcion().replace("T", "T").substring(0, 19));
                    LocalDateTime salida = LocalDateTime.parse(lote.getFechaSalidaLote().replace("T", "T").substring(0, 19));
                    long horas = Duration.between(recepcion, salida).toHours();
                    expediente.setTiempoEnPlantaHoras(horas);
                } catch (Exception e) {
                    // No calcular si hay error de formato
                }
            }
        }

        boolean estadoCadenaFrioOk = resumenFrio != null && "OK".equals(resumenFrio.getEstadoCadenaFrio());
        boolean tramiteAprobado = ultimoTramite != null && "APROBADO".equals(ultimoTramite.getEstadoTramite());
        expediente.setAptoParaExportacion(estadoCadenaFrioOk && tramiteAprobado);

        return expediente;
    }

    public List<TramiteSanipesDTO> listarTramitesPorLote(Long idLote) {
        return tramiteSanipesRepository.findByIdLote(idLote).stream()
                .map(t -> new TramiteSanipesDTO(
                        t.getId(),
                        t.getEstadoTramite(),
                        t.getNumeroCertificado(),
                        t.getIdLote()
                ))
                .collect(Collectors.toList());
    }
}
