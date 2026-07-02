package com.exporsan.lotes.service;

import com.exporsan.audit.Auditable;
import com.exporsan.lotes.model.Embarcacion;
import com.exporsan.lotes.model.Empresa;
import com.exporsan.lotes.model.Especie;
import com.exporsan.lotes.model.LotePesca;
import com.exporsan.lotes.repository.EmbarcacionRepository;
import com.exporsan.lotes.repository.EmpresaRepository;
import com.exporsan.lotes.repository.EspecieRepository;
import com.exporsan.lotes.repository.LotePescaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class LotePescaService {

    private final LotePescaRepository lotePescaRepository;
    private final EspecieRepository especieRepository;
    private final EmbarcacionRepository embarcacionRepository;
    private final EmpresaRepository empresaRepository;
    private final ExternalValidationService externalValidationService;
    private final RestTemplate restTemplate;

    @Value("${certificacion.service.url:http://localhost:8083}")
    private String certificacionServiceUrl;

    public LotePescaService(LotePescaRepository lotePescaRepository,
                            EspecieRepository especieRepository,
                            EmbarcacionRepository embarcacionRepository,
                            EmpresaRepository empresaRepository,
                            ExternalValidationService externalValidationService,
                            RestTemplate restTemplate) {
        this.lotePescaRepository = lotePescaRepository;
        this.especieRepository = especieRepository;
        this.embarcacionRepository = embarcacionRepository;
        this.empresaRepository = empresaRepository;
        this.externalValidationService = externalValidationService;
        this.restTemplate = restTemplate;
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

        if (lote.getEmbarcacion() == null && lote.getNombreEmbarcacion() != null) {
            embarcacionRepository.findByNombreEmbarcacionContainingIgnoreCase(lote.getNombreEmbarcacion())
                    .stream().findFirst()
                    .ifPresent(lote::setEmbarcacion);
        }

        if (lote.getEmpresa() == null && lote.getEmpresaRuc() != null) {
            empresaRepository.findByRuc(lote.getEmpresaRuc())
                    .ifPresent(lote::setEmpresa);
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

    @Auditable(accion = "REGISTRAR_FECHA_SALIDA", entidad = "LotePesca")
    public LotePesca registrarFechaSalida(Long id, LocalDateTime fechaSalida) {
        LotePesca lote = obtenerPorId(id);

        if (!"APROBADO".equals(lote.getEstadoSanipes()) && !"APTO_EXPORTACION".equals(lote.getEstadoSanipes())) {
            throw new IllegalStateException("El lote no tiene certificado SANIPES aprobado. No se puede registrar fecha de salida.");
        }

        if (fechaSalida.isBefore(lote.getFechaRecepcion())) {
            throw new IllegalArgumentException("La fecha de salida no puede ser anterior a la fecha de recepcion del lote.");
        }

        lote.setFechaSalidaLote(fechaSalida);
        lote.setEstadoSanipes("APTO_EXPORTACION");
        LotePesca saved = lotePescaRepository.save(lote);

        try {
            restTemplate.postForEntity(
                certificacionServiceUrl + "/api/v1/bpm/procesos/lote/" + id + "/avanzar",
                Map.of("etapa", "LISTO_PARA_DESPACHO", "observacion", "Fecha salida: " + fechaSalida.toString()),
                Void.class
            );
        } catch (Exception e) {
            // No bloquear si el BPM no responde
        }

        return saved;
    }

    public List<LotePesca> listarPorEspecieYEstado(String especie, String estado) {
        return lotePescaRepository.findByEspecieAndEstadoSanipes(especie, estado);
    }
}
