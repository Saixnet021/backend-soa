package com.exporsan.lotes.trazabilidad.service;

import com.exporsan.audit.Auditable;
import com.exporsan.lotes.model.DecolectaRucResponse;
import com.exporsan.lotes.service.RucService;
import com.exporsan.lotes.trazabilidad.dto.*;
import com.exporsan.lotes.trazabilidad.exception.EstadoInvalidoException;
import com.exporsan.lotes.trazabilidad.exception.RecursoNoEncontradoException;
import com.exporsan.lotes.trazabilidad.model.*;
import com.exporsan.lotes.trazabilidad.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TrazabilidadService {

    private final RecepcionRepository recepcionRepository;
    private final ClasificacionRepository clasificacionRepository;
    private final ProcesamientoRepository procesamientoRepository;
    private final CongelamientoRepository congelamientoRepository;
    private final DespachoRepository despachoRepository;
    private final RucService rucService;

    private final Object lock = new Object();

    public TrazabilidadService(RecepcionRepository recepcionRepository,
                               ClasificacionRepository clasificacionRepository,
                               ProcesamientoRepository procesamientoRepository,
                               CongelamientoRepository congelamientoRepository,
                               DespachoRepository despachoRepository,
                               RucService rucService) {
        this.recepcionRepository = recepcionRepository;
        this.clasificacionRepository = clasificacionRepository;
        this.procesamientoRepository = procesamientoRepository;
        this.congelamientoRepository = congelamientoRepository;
        this.despachoRepository = despachoRepository;
        this.rucService = rucService;
    }

    private String getAuthenticatedUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                return auth.getName();
            }
        } catch (Exception ignored) {
        }
        return "sistema";
    }

    // --- MÓDULO 1: RECEPCIÓN ---

    @Auditable(accion = "CREAR_RECEPCION", entidad = "Recepcion")
    public RecepcionResponseDTO registrarRecepcion(RecepcionRequestDTO dto) {
        Recepcion r = new Recepcion();
        r.setNumeroDER(dto.getNumeroDER());
        r.setNombreEmbarcacion(dto.getNombreEmbarcacion());
        r.setMatriculaEmbarcacion(dto.getMatriculaEmbarcacion());
        r.setEspecie(dto.getEspecie());
        r.setPesoBrutoBascula(dto.getPesoBrutoBascula());
        r.setTemperaturaLlegada(dto.getTemperaturaLlegada());
        r.setGuiaRemisionRemitente(dto.getGuiaRemisionRemitente());
        r.setTurno(dto.getTurno());
        r.setNombreResponsable(getAuthenticatedUser());
        r.setFechaHoraIngreso(LocalDateTime.now());
        r.setEstado(RecepcionEstado.PENDIENTE_QA);

        r = recepcionRepository.save(r);
        return mapRecepcionToDTO(r);
    }

    @Transactional(readOnly = true)
    public List<RecepcionResponseDTO> listarRecepciones() {
        return recepcionRepository.findAll().stream()
                .map(this::mapRecepcionToDTO)
                .collect(Collectors.toList());
    }

    // --- MÓDULO 2: CLASIFICACIÓN ---

    @Auditable(accion = "CREAR_CLASIFICACION", entidad = "Clasificacion")
    public ClasificacionResponseDTO registrarClasificacion(ClasificacionRequestDTO dto) {
        Recepcion recepcion = recepcionRepository.findById(dto.getLoteOrigenId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Recepcion no encontrada con id: " + dto.getLoteOrigenId()));

        // Validación de cadena de dependencia
        if (recepcion.getEstado() != RecepcionEstado.PENDIENTE_QA) {
            throw new EstadoInvalidoException("La Recepcion no está en estado PENDIENTE_QA (Estado actual: " + recepcion.getEstado() + ")");
        }

        Clasificacion c = new Clasificacion();
        c.setLoteOrigen(recepcion);
        c.setEvaluacionSensorial(dto.getEvaluacionSensorial());
        c.setCalibreTalla(dto.getCalibreTalla());
        c.setKilosMermaDescarte(dto.getKilosMermaDescarte());
        c.setMotivoRechazo(dto.getMotivoRechazo());
        c.setNombreInspectorQA(getAuthenticatedUser());
        
        // Cálculo automático de pesoUtil y merma
        BigDecimal pesoUtil = recepcion.getPesoBrutoBascula().subtract(dto.getKilosMermaDescarte());
        if (pesoUtil.compareTo(BigDecimal.ZERO) < 0) {
            pesoUtil = BigDecimal.ZERO;
        }
        c.setPesoUtil(pesoUtil);
        c.setMermaTotal(dto.getKilosMermaDescarte());
        c.setFirmaQA(dto.getFirmaQA());
        c.setEstado(dto.getEstado());

        c = clasificacionRepository.save(c);

        // Cambiar estado de la recepción para indicar que ha sido clasificada
        recepcion.setEstado(RecepcionEstado.CLASIFICADA);
        recepcionRepository.save(recepcion);

        return mapClasificacionToDTO(c);
    }

    @Transactional(readOnly = true)
    public List<ClasificacionResponseDTO> listarClasificaciones(boolean incluirRechazados) {
        List<Clasificacion> list;
        if (incluirRechazados) {
            list = clasificacionRepository.findAll();
        } else {
            list = clasificacionRepository.findAllByEstadoNot(ClasificacionEstado.RECHAZADO_TOTAL);
        }
        return list.stream().map(this::mapClasificacionToDTO).collect(Collectors.toList());
    }

    // --- MÓDULO 3: PROCESAMIENTO ---

    @Auditable(accion = "CREAR_PROCESAMIENTO", entidad = "Procesamiento")
    public ProcesamientoResponseDTO registrarProcesamiento(ProcesamientoRequestDTO dto) {
        Clasificacion clasificacion = clasificacionRepository.findById(dto.getLoteOrigenId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Clasificacion no encontrada con id: " + dto.getLoteOrigenId()));

        // Validación de cadena de dependencia
        if (clasificacion.getEstado() == ClasificacionEstado.RECHAZADO_TOTAL) {
            throw new EstadoInvalidoException("No se puede procesar un lote en estado RECHAZADO_TOTAL");
        }

        Procesamiento p = new Procesamiento();
        p.setLoteOrigen(clasificacion);
        p.setTipoCorte(dto.getTipoCorte());
        p.setTratamientoQuimico(dto.getTratamientoQuimico());
        p.setTipoEmpaque(dto.getTipoEmpaque());
        p.setCantidadBultosCajas(dto.getCantidadBultosCajas());
        p.setPesoNetoFinal(dto.getPesoNetoFinal());
        p.setLineaProceso(dto.getLineaProceso());
        p.setNombreSupervisor(getAuthenticatedUser());

        // Generar idLoteProduccion seguro con bloqueo synchronized
        String especieStr = clasificacion.getLoteOrigen().getEspecie().name();
        String idLoteProduccion;
        // TODO: no escala a múltiples instancias
        synchronized (lock) {
            String prefix = "LOTE-" + especieStr + "-";
            long count = procesamientoRepository.countByIdLoteProduccionStartingWith(prefix);
            long nextSeq = count + 1;
            idLoteProduccion = prefix + String.format("%03d", nextSeq);
        }
        p.setIdLoteProduccion(idLoteProduccion);

        // Cálculo de porcentajeRendimiento = (pesoNetoFinal / pesoUtil) * 100
        BigDecimal rendimiento = BigDecimal.ZERO;
        if (clasificacion.getPesoUtil().compareTo(BigDecimal.ZERO) > 0) {
            rendimiento = dto.getPesoNetoFinal()
                    .divide(clasificacion.getPesoUtil(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        p.setPorcentajeRendimiento(rendimiento);
        p.setEstado(ProcesamientoEstado.LISTO_PARA_ENFRIAR);

        p = procesamientoRepository.save(p);
        return mapProcesamientoToDTO(p);
    }

    @Transactional(readOnly = true)
    public List<ProcesamientoResponseDTO> listarProcesamientos() {
        return procesamientoRepository.findAll().stream()
                .map(this::mapProcesamientoToDTO)
                .collect(Collectors.toList());
    }

    // --- MÓDULO 4: CONGELAMIENTO Y ALMACENAMIENTO ---

    @Auditable(accion = "REGISTRAR_TUNEL", entidad = "Congelamiento")
    public CongelamientoResponseDTO registrarTunel(CongelamientoTunelRequestDTO dto) {
        Procesamiento procesamiento = procesamientoRepository.findById(dto.getLoteOrigenId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Procesamiento no encontrado con id: " + dto.getLoteOrigenId()));

        // Validación de cadena de dependencia
        if (procesamiento.getEstado() != ProcesamientoEstado.LISTO_PARA_ENFRIAR) {
            throw new EstadoInvalidoException("El procesamiento no está en estado LISTO_PARA_ENFRIAR (Estado actual: " + procesamiento.getEstado() + ")");
        }

        // Buscar si ya existe un congelamiento para este lote de origen, sino crear uno
        Congelamiento c = congelamientoRepository.findByLoteOrigen(procesamiento)
                .orElseGet(() -> {
                    Congelamiento nuevo = new Congelamiento();
                    nuevo.setLoteOrigen(procesamiento);
                    return nuevo;
                });

        c.setNumeroTunel(dto.getNumeroTunel());
        c.setFechaHoraIngresoTunel(dto.getFechaHoraIngresoTunel());
        c.setFechaHoraSalidaTunel(dto.getFechaHoraSalidaTunel());
        c.setTemperaturaCentroTermico(dto.getTemperaturaCentroTermico());

        // Phase 4.1 & 4.2
        c.setMetodoCongelamiento(dto.getMetodoCongelamiento());
        c.setNumeroEquipoFrio(dto.getNumeroEquipoFrio() != null ? dto.getNumeroEquipoFrio() : dto.getNumeroTunel());
        c.setPorcentajeGlaseado(dto.getPorcentajeGlaseado());
        c.setTipoEmpaquePrimario(dto.getTipoEmpaquePrimario());
        c.setTipoEmpaqueSecundario(dto.getTipoEmpaqueSecundario());
        c.setPesoBrutoCaja(dto.getPesoBrutoCaja());
        c.setPesoNetoDeclarado(dto.getPesoNetoDeclarado());
        c.setCantidadCajasFinales(dto.getCantidadCajasFinales());
        c.setZunchoSeguridad(dto.getZunchoSeguridad());

        // Autocomplete del operario según rol
        c.setNombreOperarioTunel(getAuthenticatedUser());

        // Regla de temperatura crítica <= -18°C
        if (dto.getTemperaturaCentroTermico().compareTo(new BigDecimal("-18")) > 0) {
            c.setEstado(CongelamientoEstado.NO_APTO_RETENIDO);
        } else {
            c.setEstado(CongelamientoEstado.EN_TUNEL);
        }

        c = congelamientoRepository.save(c);
        return mapCongelamientoToDTO(c);
    }

    @Auditable(accion = "REGISTRAR_CAMARA", entidad = "Congelamiento")
    public CongelamientoResponseDTO registrarCamara(CongelamientoCamaraRequestDTO dto) {
        Procesamiento procesamiento = procesamientoRepository.findById(dto.getLoteOrigenId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Procesamiento no encontrado con id: " + dto.getLoteOrigenId()));

        Congelamiento c = congelamientoRepository.findByLoteOrigen(procesamiento)
                .orElseThrow(() -> new EstadoInvalidoException("Debe completar primero el paso Túnel para este lote de origen"));

        c.setCamaraDestino(dto.getCamaraDestino());
        c.setFechaHoraIngresoCamara(dto.getFechaHoraIngresoCamara());
        c.setFechaProgramadaDespacho(dto.getFechaProgramadaDespacho());
        c.setEstadoInocuidadHACCP(dto.getEstadoInocuidadHACCP());

        // Phase 4.3 - Metal Detector
        c.setPasoDetectorMetales(dto.getPasoDetectorMetales());
        c.setPruebaPatronDetector(dto.getPruebaPatronDetector());
        c.setOperarioDetector(dto.getOperarioDetector() != null ? dto.getOperarioDetector() : getAuthenticatedUser());

        // Phase 4.4 - Lab Controls
        c.setNivelHistaminaPpm(dto.getNivelHistaminaPpm());
        c.setPruebaTvbn(dto.getPruebaTvbn());
        c.setSaborResidualAcido(dto.getSaborResidualAcido());
        c.setAnalisisMicrobiologico(dto.getAnalisisMicrobiologico());

        // Phase 4.5 - Logistics
        c.setTipoPallet(dto.getTipoPallet());
        c.setUbicacionRack(dto.getUbicacionRack());
        c.setEstadoLiberacionHaccp(dto.getEstadoLiberacionHaccp());

        // Autocomplete inspector calidad frío
        c.setNombreInspectorQAFrio(getAuthenticatedUser());

        // Calcular fechaVencimiento = fechaHoraIngresoCamara + 18 meses
        c.setFechaVencimiento(dto.getFechaHoraIngresoCamara().toLocalDate().plusMonths(18));

        // Determinar estado final basándose en reglas sanitarias y de metales
        EspecieEnum especie = null;
        if (procesamiento.getLoteOrigen() != null && procesamiento.getLoteOrigen().getLoteOrigen() != null) {
            especie = procesamiento.getLoteOrigen().getLoteOrigen().getEspecie();
        }

        boolean esRechazado = false;
        boolean esCuarentena = false;

        // Temp centro termico check
        if (c.getTemperaturaCentroTermico() != null && c.getTemperaturaCentroTermico().compareTo(new BigDecimal("-18")) > 0) {
            esRechazado = true;
        }

        // Metal detector check
        if ("Rechazado por Detección".equals(dto.getPasoDetectorMetales())) {
            esRechazado = true;
        }

        // Microbiology check
        if ("Contaminado".equals(dto.getAnalisisMicrobiologico())) {
            esRechazado = true;
        } else if ("En proceso".equals(dto.getAnalisisMicrobiologico())) {
            esCuarentena = true;
        }

        // Species checks
        if (especie == EspecieEnum.PERICO) {
            if (dto.getNivelHistaminaPpm() != null) {
                if (dto.getNivelHistaminaPpm().compareTo(new BigDecimal("50")) > 0) {
                    esRechazado = true;
                }
            } else {
                esCuarentena = true;
            }
        } else if (especie == EspecieEnum.POTA) {
            if (dto.getPruebaTvbn() != null) {
                if (dto.getPruebaTvbn().compareTo(new BigDecimal("30")) > 0) {
                    esRechazado = true;
                }
            } else {
                esCuarentena = true;
            }
            if ("Presente".equals(dto.getSaborResidualAcido())) {
                esRechazado = true;
            }
        }

        // HACCP check
        if (dto.getEstadoInocuidadHACCP() == EstadoInocuidadHaccp.RETENIDO || "RETENIDO".equals(dto.getEstadoLiberacionHaccp())) {
            esCuarentena = true;
        }

        // Final state setting
        if (esRechazado) {
            c.setEstado(CongelamientoEstado.NO_APTO_RETENIDO);
        } else if (esCuarentena) {
            c.setEstado(CongelamientoEstado.CUARENTENA);
        } else {
            c.setEstado(CongelamientoEstado.APTO_PARA_EXPORTACION);
        }

        c = congelamientoRepository.save(c);
        return mapCongelamientoToDTO(c);
    }

    @Transactional(readOnly = true)
    public List<CongelamientoResponseDTO> listarCongelamientos() {
        return congelamientoRepository.findAll().stream()
                .map(this::mapCongelamientoToDTO)
                .collect(Collectors.toList());
    }

    // --- MÓDULO 5: DESPACHO ---

    @Transactional(readOnly = true)
    public List<CongelamientoResponseDTO> listarDisponiblesDespacho() {
        return congelamientoRepository.findAvailableForDispatch().stream()
                .map(this::mapCongelamientoToDTO)
                .collect(Collectors.toList());
    }

    @Auditable(accion = "CREAR_DESPACHO", entidad = "Despacho")
    public DespachoResponseDTO registrarDespacho(DespachoRequestDTO dto) {
        Congelamiento lot = congelamientoRepository.findById(dto.getLoteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Lote de congelamiento no encontrado con id: " + dto.getLoteId()));

        // Validación de cadena de dependencia
        if (lot.getEstado() != CongelamientoEstado.APTO_PARA_EXPORTACION) {
            throw new EstadoInvalidoException("Solo se pueden despachar lotes en estado APTO_PARA_EXPORTACION (Estado actual: " + lot.getEstado() + ")");
        }

        // Verificar si ya está despachado
        Optional<Despacho> despExist = despachoRepository.findByLote(lot);
        if (despExist.isPresent() && despExist.get().getEstado() == DespachoEstado.DESPACHADO_EN_TRANSITO) {
            throw new EstadoInvalidoException("El lote ya se encuentra despachado en tránsito");
        }

        // RUC Lookup con fallback
        String razonSocial = null;
        try {
            DecolectaRucResponse response = rucService.consultarRuc(dto.getRucCliente());
            if (response != null && response.getRazonSocial() != null) {
                razonSocial = response.getRazonSocial();
            }
        } catch (Exception e) {
            // Error en la llamada al RucService (timeout, caida, etc)
            if (dto.getRazonSocialCliente() != null && !dto.getRazonSocialCliente().trim().isEmpty()) {
                razonSocial = dto.getRazonSocialCliente();
            } else {
                throw new IllegalArgumentException("Error al consultar el RUC en el servicio externo y no se proporcionó Razón Social de fallback: " + e.getMessage());
            }
        }

        if (razonSocial == null) {
            if (dto.getRazonSocialCliente() != null && !dto.getRazonSocialCliente().trim().isEmpty()) {
                razonSocial = dto.getRazonSocialCliente();
            } else {
                throw new IllegalArgumentException("No se encontró Razón Social para el RUC: " + dto.getRucCliente());
            }
        }

        Despacho d = despExist.orElseGet(Despacho::new);
        d.setLote(lot);
        d.setRucCliente(dto.getRucCliente());
        d.setRazonSocialCliente(razonSocial);
        d.setPuertoDestino(dto.getPuertoDestino());
        d.setReservaNaviera(dto.getReservaNaviera());
        d.setNumeroContenedorFrigorifico(dto.getNumeroContenedorFrigorifico());
        d.setPrecintosAduanerosNavieros(dto.getPrecintosAduanerosNavieros());
        d.setTemperaturaSeteoContenedor(dto.getTemperaturaSeteoContenedor());
        d.setNumeroDUS(dto.getNumeroDUS());
        d.setCodigoCertificadoSanitario(dto.getCodigoCertificadoSanitario());
        d.setNombreDespachador(getAuthenticatedUser());
        d.setEstado(dto.getEstado());

        d = despachoRepository.save(d);

        return mapDespachoToDTO(d);
    }

    @Transactional(readOnly = true)
    public TrazabilidadCompletaDTO obtenerTrazabilidadCompleta(Long congelamientoId) {
        Congelamiento c = congelamientoRepository.findById(congelamientoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lote de congelamiento no encontrado con id: " + congelamientoId));

        Procesamiento p = c.getLoteOrigen();
        Clasificacion cl = p.getLoteOrigen();
        Recepcion r = cl.getLoteOrigen();

        DespachoResponseDTO despachoDTO = despachoRepository.findByLote(c)
                .map(this::mapDespachoToDTO)
                .orElse(null);

        TrazabilidadCompletaDTO trace = new TrazabilidadCompletaDTO();
        trace.setRecepcion(mapRecepcionToDTO(r));
        trace.setClasificacion(mapClasificacionToDTO(cl));
        trace.setProcesamiento(mapProcesamientoToDTO(p));
        trace.setCongelamiento(mapCongelamientoToDTO(c));
        trace.setDespacho(despachoDTO);

        return trace;
    }

    @Transactional(readOnly = true)
    public DespachoResponseDTO obtenerDespachoPorId(Long id) {
        Despacho d = despachoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Despacho no encontrado con id: " + id));
        return mapDespachoToDTO(d);
    }

    // --- MAPPERS INTERNOS ---

    private RecepcionResponseDTO mapRecepcionToDTO(Recepcion r) {
        if (r == null) return null;
        RecepcionResponseDTO d = new RecepcionResponseDTO();
        d.setIdTicket(r.getIdTicket());
        d.setNumeroDER(r.getNumeroDER());
        d.setNombreEmbarcacion(r.getNombreEmbarcacion());
        d.setMatriculaEmbarcacion(r.getMatriculaEmbarcacion());
        d.setEspecie(r.getEspecie());
        d.setPesoBrutoBascula(r.getPesoBrutoBascula());
        d.setTemperaturaLlegada(r.getTemperaturaLlegada());
        d.setGuiaRemisionRemitente(r.getGuiaRemisionRemitente());
        d.setTurno(r.getTurno());
        d.setNombreResponsable(r.getNombreResponsable());
        d.setFechaHoraIngreso(r.getFechaHoraIngreso());
        d.setEstado(r.getEstado().name());
        d.setColorHex(r.getEstado().getColorHex());
        d.setEmoji(r.getEstado().getEmoji());
        return d;
    }

    private ClasificacionResponseDTO mapClasificacionToDTO(Clasificacion c) {
        if (c == null) return null;
        ClasificacionResponseDTO d = new ClasificacionResponseDTO();
        d.setId(c.getId());
        d.setLoteOrigen(mapRecepcionToDTO(c.getLoteOrigen()));
        d.setEvaluacionSensorial(c.getEvaluacionSensorial());
        d.setCalibreTalla(c.getCalibreTalla());
        d.setKilosMermaDescarte(c.getKilosMermaDescarte());
        d.setMotivoRechazo(c.getMotivoRechazo());
        d.setNombreInspectorQA(c.getNombreInspectorQA());
        d.setPesoUtil(c.getPesoUtil());
        d.setMermaTotal(c.getMermaTotal());
        d.setFirmaQA(c.getFirmaQA());
        d.setEstado(c.getEstado().name());
        d.setColorHex(c.getEstado().getColorHex());
        d.setEmoji(c.getEstado().getEmoji());
        return d;
    }

    private ProcesamientoResponseDTO mapProcesamientoToDTO(Procesamiento p) {
        if (p == null) return null;
        ProcesamientoResponseDTO d = new ProcesamientoResponseDTO();
        d.setId(p.getId());
        d.setLoteOrigen(mapClasificacionToDTO(p.getLoteOrigen()));
        d.setTipoCorte(p.getTipoCorte());
        d.setTratamientoQuimico(p.getTratamientoQuimico());
        d.setTipoEmpaque(p.getTipoEmpaque());
        d.setCantidadBultosCajas(p.getCantidadBultosCajas());
        d.setPesoNetoFinal(p.getPesoNetoFinal());
        d.setLineaProceso(p.getLineaProceso());
        d.setNombreSupervisor(p.getNombreSupervisor());
        d.setIdLoteProduccion(p.getIdLoteProduccion());
        d.setPorcentajeRendimiento(p.getPorcentajeRendimiento());
        d.setEstado(p.getEstado().name());
        d.setColorHex(p.getEstado().getColorHex());
        d.setEmoji(p.getEstado().getEmoji());
        return d;
    }

    private CongelamientoResponseDTO mapCongelamientoToDTO(Congelamiento c) {
        if (c == null) return null;
        CongelamientoResponseDTO d = new CongelamientoResponseDTO();
        d.setId(c.getId());
        d.setLoteOrigen(mapProcesamientoToDTO(c.getLoteOrigen()));
        d.setNumeroTunel(c.getNumeroTunel());
        d.setFechaHoraIngresoTunel(c.getFechaHoraIngresoTunel());
        d.setFechaHoraSalidaTunel(c.getFechaHoraSalidaTunel());
        d.setTemperaturaCentroTermico(c.getTemperaturaCentroTermico());
        d.setNombreOperarioTunel(c.getNombreOperarioTunel());
        d.setNombreInspectorQAFrio(c.getNombreInspectorQAFrio());

        // Phase 4.1 & 4.2 fields
        d.setMetodoCongelamiento(c.getMetodoCongelamiento());
        d.setNumeroEquipoFrio(c.getNumeroEquipoFrio());
        d.setPorcentajeGlaseado(c.getPorcentajeGlaseado());
        d.setTipoEmpaquePrimario(c.getTipoEmpaquePrimario());
        d.setTipoEmpaqueSecundario(c.getTipoEmpaqueSecundario());
        d.setPesoBrutoCaja(c.getPesoBrutoCaja());
        d.setPesoNetoDeclarado(c.getPesoNetoDeclarado());
        d.setCantidadCajasFinales(c.getCantidadCajasFinales());
        d.setZunchoSeguridad(c.getZunchoSeguridad());

        // Phase 4.3 - Metal Detector
        d.setPasoDetectorMetales(c.getPasoDetectorMetales());
        d.setPruebaPatronDetector(c.getPruebaPatronDetector());
        d.setOperarioDetector(c.getOperarioDetector());

        // Phase 4.4 - Quality Lab Controls
        d.setNivelHistaminaPpm(c.getNivelHistaminaPpm());
        d.setPruebaTvbn(c.getPruebaTvbn());
        d.setSaborResidualAcido(c.getSaborResidualAcido());
        d.setAnalisisMicrobiologico(c.getAnalisisMicrobiologico());

        // Phase 4.5 - Logistics / Storing
        d.setTipoPallet(c.getTipoPallet());
        d.setUbicacionRack(c.getUbicacionRack());
        d.setEstadoLiberacionHaccp(c.getEstadoLiberacionHaccp());

        d.setCamaraDestino(c.getCamaraDestino());
        d.setFechaHoraIngresoCamara(c.getFechaHoraIngresoCamara());
        d.setFechaProgramadaDespacho(c.getFechaProgramadaDespacho());
        d.setEstadoInocuidadHACCP(c.getEstadoInocuidadHACCP());
        d.setFechaVencimiento(c.getFechaVencimiento());
        d.setEstado(c.getEstado().name());
        d.setColorHex(c.getEstado().getColorHex());
        d.setEmoji(c.getEstado().getEmoji());
        return d;
    }

    private DespachoResponseDTO mapDespachoToDTO(Despacho d) {
        if (d == null) return null;
        DespachoResponseDTO dto = new DespachoResponseDTO();
        dto.setId(d.getId());
        dto.setLote(mapCongelamientoToDTO(d.getLote()));
        dto.setRucCliente(d.getRucCliente());
        dto.setRazonSocialCliente(d.getRazonSocialCliente());
        dto.setPuertoDestino(d.getPuertoDestino());
        dto.setReservaNaviera(d.getReservaNaviera());
        dto.setNumeroContenedorFrigorifico(d.getNumeroContenedorFrigorifico());
        dto.setPrecintosAduanerosNavieros(d.getPrecintosAduanerosNavieros());
        dto.setTemperaturaSeteoContenedor(d.getTemperaturaSeteoContenedor());
        dto.setNumeroDUS(d.getNumeroDUS());
        dto.setCodigoCertificadoSanitario(d.getCodigoCertificadoSanitario());
        dto.setNombreDespachador(d.getNombreDespachador());
        dto.setEstado(d.getEstado().name());
        dto.setColorHex(d.getEstado().getColorHex());
        dto.setEmoji(d.getEstado().getEmoji());
        return dto;
    }
}
