package com.exporsan.certificacion.service;

import com.exporsan.audit.Auditable;
import com.exporsan.certificacion.dto.*;
import com.exporsan.certificacion.model.TramiteSanipes;
import com.exporsan.certificacion.repository.TramiteSanipesRepository;
import com.exporsan.lotes.service.LotePescaService;
import com.exporsan.lotes.model.LotePesca;
import com.exporsan.calidad.service.AuditoriaCalidadService;
import org.springframework.stereotype.Service;

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
    private final LotePescaService lotePescaService;
    private final AuditoriaCalidadService auditoriaCalidadService;

    public CertificacionService(TramiteSanipesRepository tramiteSanipesRepository,
                                LotePescaService lotePescaService,
                                AuditoriaCalidadService auditoriaCalidadService) {
        this.tramiteSanipesRepository = tramiteSanipesRepository;
        this.lotePescaService = lotePescaService;
        this.auditoriaCalidadService = auditoriaCalidadService;
    }

    @Auditable(accion = "SOLICITAR_CERTIFICADO", entidad = "TramiteSanipes")
    public TramiteSanipesDTO orquestarTramite(Long idLote) {
        LotePesca lotePesca;
        try {
            lotePesca = lotePescaService.obtenerPorId(idLote);
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo obtener la información del lote. Verifique que el servicio de lotes esté activo.");
        }

        com.exporsan.calidad.dto.ResumenFrioDTO resumenFrioCalidad;
        try {
            resumenFrioCalidad = auditoriaCalidadService.obtenerResumenFrio(idLote);
        } catch (jakarta.persistence.EntityNotFoundException ex) {
            throw new IllegalStateException("No se puede solicitar el certificado porque no se han registrado mediciones de temperatura para este lote.");
        } catch (Exception ex) {
            throw new IllegalStateException("El servicio de monitoreo de frío no se encuentra disponible.");
        }

        if (resumenFrioCalidad == null || !"OK".equals(resumenFrioCalidad.getEstadoCadenaFrio())) {
            throw new IllegalStateException("La cadena de frío no está en estado OK para el lote " + idLote);
        }

        if (lotePesca == null || lotePesca.getPesoKg() == null || lotePesca.getPesoKg() <= 0) {
            throw new IllegalStateException("El peso del lote " + idLote + " es inválido");
        }

        String numeroCertificado = "CERT-" + Year.now().getValue() + "-" + idLote + "-" +
                String.format("%04d", ThreadLocalRandom.current().nextInt(1000, 9999));

        TramiteSanipes tramite = new TramiteSanipes();
        tramite.setIdLote(idLote);
        tramite.setFechaSolicitud(LocalDateTime.now());
        tramite.setEstadoTramite("APROBADO");
        tramite.setNumeroCertificado(numeroCertificado);
        tramite.setFechaAprobacion(LocalDateTime.now());

        tramiteSanipesRepository.save(tramite);

        lotePescaService.actualizarEstadoSanipes(idLote, "APROBADO");

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
            LotePesca lp = lotePescaService.obtenerPorId(idLote);
            lote = mapToLoteDTO(lp);
        } catch (Exception ex) {
            // No bloquear
        }

        ResumenFrioDTO resumenFrio = null;
        try {
            com.exporsan.calidad.dto.ResumenFrioDTO rfc = auditoriaCalidadService.obtenerResumenFrio(idLote);
            resumenFrio = mapToResumenFrioDTO(rfc);
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

    private LoteDTO mapToLoteDTO(LotePesca lote) {
        if (lote == null) return null;
        LoteDTO dto = new LoteDTO();
        dto.setId(lote.getId());
        dto.setCodigoLote(lote.getCodigoLote());
        dto.setEspecie(lote.getEspecie());
        dto.setNombreEmbarcacion(lote.getNombreEmbarcacion());
        dto.setMatriculaEmbarcacion(lote.getMatriculaEmbarcacion());
        dto.setCapitanEmbarcacion(lote.getCapitanEmbarcacion());
        dto.setEmpresaRazonSocial(lote.getEmpresaRazonSocial());
        dto.setEmpresaRuc(lote.getEmpresaRuc());
        dto.setPesoKg(lote.getPesoKg());
        dto.setEstadoSanipes(lote.getEstadoSanipes());
        dto.setEstadoCadenaFrio(lote.getEstadoCadenaFrio());
        if (lote.getFechaRecepcion() != null) {
            dto.setFechaRecepcion(lote.getFechaRecepcion().toString());
        }
        if (lote.getFechaSalidaLote() != null) {
            dto.setFechaSalidaLote(lote.getFechaSalidaLote().toString());
        }
        return dto;
    }

    private ResumenFrioDTO mapToResumenFrioDTO(com.exporsan.calidad.dto.ResumenFrioDTO resumen) {
        if (resumen == null) return null;
        ResumenFrioDTO dto = new ResumenFrioDTO();
        dto.setTempMin(resumen.getTempMin());
        dto.setTempMax(resumen.getTempMax());
        dto.setTempPromedio(resumen.getTempPromedio());
        dto.setHayAlerta(resumen.isHayAlerta());
        dto.setEstadoCadenaFrio(resumen.getEstadoCadenaFrio());
        return dto;
    }
}
