package com.exporsan.lotes.trazabilidad.service;

import com.exporsan.lotes.model.DecolectaRucResponse;
import com.exporsan.lotes.service.RucService;
import com.exporsan.lotes.trazabilidad.dto.*;
import com.exporsan.lotes.trazabilidad.exception.EstadoInvalidoException;
import com.exporsan.lotes.trazabilidad.model.*;
import com.exporsan.lotes.trazabilidad.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TrazabilidadServiceTest {

    private RecepcionRepository recepcionRepository;
    private ClasificacionRepository clasificacionRepository;
    private ProcesamientoRepository procesamientoRepository;
    private CongelamientoRepository congelamientoRepository;
    private DespachoRepository despachoRepository;
    private RucService rucService;

    private TrazabilidadService service;

    @BeforeEach
    void setUp() {
        recepcionRepository = mock(RecepcionRepository.class);
        clasificacionRepository = mock(ClasificacionRepository.class);
        procesamientoRepository = mock(ProcesamientoRepository.class);
        congelamientoRepository = mock(CongelamientoRepository.class);
        despachoRepository = mock(DespachoRepository.class);
        rucService = mock(RucService.class);

        service = new TrazabilidadService(
                recepcionRepository,
                clasificacionRepository,
                procesamientoRepository,
                congelamientoRepository,
                despachoRepository,
                rucService
        );
    }

    private Procesamiento createDummyProcesamiento() {
        Recepcion r = new Recepcion();
        r.setEstado(RecepcionEstado.PENDIENTE_QA);
        r.setEspecie(EspecieEnum.POTA);

        Clasificacion cl = new Clasificacion();
        cl.setLoteOrigen(r);
        cl.setEstado(ClasificacionEstado.APROBADO_CORTE);

        Procesamiento p = new Procesamiento();
        p.setId(20L);
        p.setLoteOrigen(cl);
        p.setEstado(ProcesamientoEstado.LISTO_PARA_ENFRIAR);
        return p;
    }

    @Test
    void testRegistrarRecepcion() {
        RecepcionRequestDTO dto = new RecepcionRequestDTO(
                "DER-001", "Mi Bote", "MAT-123", EspecieEnum.POTA,
                new BigDecimal("1000.0"), new BigDecimal("4.5"), "GR-999", TurnoEnum.MAÑANA
        );

        when(recepcionRepository.save(any(Recepcion.class))).thenAnswer(inv -> {
            Recepcion r = inv.getArgument(0);
            r.setIdTicket(1L);
            return r;
        });

        RecepcionResponseDTO res = service.registrarRecepcion(dto);

        assertNotNull(res);
        assertEquals(1L, res.getIdTicket());
        assertEquals("PENDIENTE_QA", res.getEstado());
        assertEquals(EspecieEnum.POTA, res.getEspecie());
    }

    @Test
    void testRegistrarClasificacionHappyPath() {
        Recepcion r = new Recepcion();
        r.setIdTicket(1L);
        r.setPesoBrutoBascula(new BigDecimal("1000.0"));
        r.setEstado(RecepcionEstado.PENDIENTE_QA);

        when(recepcionRepository.findById(1L)).thenReturn(Optional.of(r));
        when(clasificacionRepository.save(any(Clasificacion.class))).thenAnswer(inv -> {
            Clasificacion c = inv.getArgument(0);
            c.setId(10L);
            return c;
        });

        ClasificacionRequestDTO dto = new ClasificacionRequestDTO(
                1L, EvaluacionSensorialEnum.FIRME, CalibreTallaEnum.M,
                new BigDecimal("150.0"), null, "firmaInspector", ClasificacionEstado.APROBADO_CORTE
        );

        ClasificacionResponseDTO res = service.registrarClasificacion(dto);

        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals("APROBADO_CORTE", res.getEstado());
        assertEquals(new BigDecimal("850.0"), res.getPesoUtil());
        assertEquals(RecepcionEstado.CLASIFICADA, r.getEstado());
    }

    @Test
    void testRegistrarClasificacionConflict() {
        Recepcion r = new Recepcion();
        r.setIdTicket(1L);
        r.setEstado(RecepcionEstado.CLASIFICADA);

        when(recepcionRepository.findById(1L)).thenReturn(Optional.of(r));

        ClasificacionRequestDTO dto = new ClasificacionRequestDTO(
                1L, EvaluacionSensorialEnum.FIRME, CalibreTallaEnum.M,
                new BigDecimal("150.0"), null, "firmaInspector", ClasificacionEstado.APROBADO_CORTE
        );

        assertThrows(EstadoInvalidoException.class, () -> service.registrarClasificacion(dto));
    }

    @Test
    void testRegistrarProcesamientoHappyPath() {
        Recepcion r = new Recepcion();
        r.setEspecie(EspecieEnum.POTA);
        r.setEstado(RecepcionEstado.PENDIENTE_QA);

        Clasificacion c = new Clasificacion();
        c.setId(10L);
        c.setLoteOrigen(r);
        c.setPesoUtil(new BigDecimal("850.0"));
        c.setEstado(ClasificacionEstado.APROBADO_CORTE);

        when(clasificacionRepository.findById(10L)).thenReturn(Optional.of(c));
        when(procesamientoRepository.countByIdLoteProduccionStartingWith("LOTE-POTA-")).thenReturn(5L);
        when(procesamientoRepository.save(any(Procesamiento.class))).thenAnswer(inv -> {
            Procesamiento p = inv.getArgument(0);
            p.setId(20L);
            return p;
        });

        ProcesamientoRequestDTO dto = new ProcesamientoRequestDTO(
                10L, TipoCorteEnum.FILETE, TratamientoQuimicoEnum.NATURAL,
                TipoEmpaqueEnum.CAJA_MASTER_10KG, 50, new BigDecimal("680.0"), "Línea 1"
        );

        ProcesamientoResponseDTO res = service.registrarProcesamiento(dto);

        assertNotNull(res);
        assertEquals("LOTE-POTA-006", res.getIdLoteProduccion());
        assertEquals(new BigDecimal("80.00"), res.getPorcentajeRendimiento());
        assertEquals("LISTO_PARA_ENFRIAR", res.getEstado());
    }

    @Test
    void testRegistrarProcesamientoRechazado() {
        Clasificacion c = new Clasificacion();
        c.setId(10L);
        c.setEstado(ClasificacionEstado.RECHAZADO_TOTAL);

        when(clasificacionRepository.findById(10L)).thenReturn(Optional.of(c));

        ProcesamientoRequestDTO dto = new ProcesamientoRequestDTO(
                10L, TipoCorteEnum.FILETE, TratamientoQuimicoEnum.NATURAL,
                TipoEmpaqueEnum.CAJA_MASTER_10KG, 50, new BigDecimal("680.0"), "Línea 1"
        );

        assertThrows(EstadoInvalidoException.class, () -> service.registrarProcesamiento(dto));
    }

    @Test
    void testRegistrarTunelHappyPath() {
        Procesamiento p = createDummyProcesamiento();

        when(procesamientoRepository.findById(20L)).thenReturn(Optional.of(p));
        when(congelamientoRepository.findByLoteOrigen(p)).thenReturn(Optional.empty());
        when(congelamientoRepository.save(any(Congelamiento.class))).thenAnswer(inv -> inv.getArgument(0));

        CongelamientoTunelRequestDTO dto = new CongelamientoTunelRequestDTO(
                20L, "Túnel 1", LocalDateTime.now(), LocalDateTime.now().plusHours(4), new BigDecimal("-19.5")
        );

        CongelamientoResponseDTO res = service.registrarTunel(dto);

        assertNotNull(res);
        assertEquals("EN_TUNEL", res.getEstado());
    }

    @Test
    void testRegistrarTunelCriticalTempFailure() {
        Procesamiento p = createDummyProcesamiento();

        when(procesamientoRepository.findById(20L)).thenReturn(Optional.of(p));
        when(congelamientoRepository.findByLoteOrigen(p)).thenReturn(Optional.empty());
        when(congelamientoRepository.save(any(Congelamiento.class))).thenAnswer(inv -> inv.getArgument(0));

        CongelamientoTunelRequestDTO dto = new CongelamientoTunelRequestDTO(
                20L, "Túnel 1", LocalDateTime.now(), LocalDateTime.now().plusHours(4), new BigDecimal("-15.0")
        );

        CongelamientoResponseDTO res = service.registrarTunel(dto);

        assertNotNull(res);
        assertEquals("NO_APTO_RETENIDO", res.getEstado());
    }

    @Test
    void testRegistrarCamaraWithoutTunel() {
        Procesamiento p = createDummyProcesamiento();

        when(procesamientoRepository.findById(20L)).thenReturn(Optional.of(p));
        when(congelamientoRepository.findByLoteOrigen(p)).thenReturn(Optional.empty());

        CongelamientoCamaraRequestDTO dto = new CongelamientoCamaraRequestDTO(
                20L, "Cámara A", LocalDateTime.now(), LocalDate.now().plusDays(5), EstadoInocuidadHaccp.APTO
        );

        assertThrows(EstadoInvalidoException.class, () -> service.registrarCamara(dto));
    }

    @Test
    void testRegistrarCamaraHappyPathAndVencimiento() {
        Procesamiento p = createDummyProcesamiento();

        Congelamiento c = new Congelamiento();
        c.setLoteOrigen(p);
        c.setTemperaturaCentroTermico(new BigDecimal("-20.0"));
        c.setEstado(CongelamientoEstado.EN_TUNEL);

        when(procesamientoRepository.findById(20L)).thenReturn(Optional.of(p));
        when(congelamientoRepository.findByLoteOrigen(p)).thenReturn(Optional.of(c));
        when(congelamientoRepository.save(any(Congelamiento.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDateTime ingresoCamara = LocalDateTime.of(2026, 7, 10, 10, 0);

        CongelamientoCamaraRequestDTO dto = new CongelamientoCamaraRequestDTO(
                20L, "Cámara A", ingresoCamara, LocalDate.now().plusDays(5), EstadoInocuidadHaccp.APTO
        );
        dto.setPruebaTvbn(new BigDecimal("15.0"));
        dto.setSaborResidualAcido("Ausente");
        dto.setPasoDetectorMetales("Conforme");
        dto.setPruebaPatronDetector(true);

        CongelamientoResponseDTO res = service.registrarCamara(dto);

        assertNotNull(res);
        assertEquals("APTO_PARA_EXPORTACION", res.getEstado());
        assertEquals(LocalDate.of(2028, 1, 10), res.getFechaVencimiento());
    }

    @Test
    void testRegistrarCamaraHaccpRetenido() {
        Procesamiento p = createDummyProcesamiento();

        Congelamiento c = new Congelamiento();
        c.setLoteOrigen(p);
        c.setTemperaturaCentroTermico(new BigDecimal("-20.0"));
        c.setEstado(CongelamientoEstado.EN_TUNEL);

        when(procesamientoRepository.findById(20L)).thenReturn(Optional.of(p));
        when(congelamientoRepository.findByLoteOrigen(p)).thenReturn(Optional.of(c));
        when(congelamientoRepository.save(any(Congelamiento.class))).thenAnswer(inv -> inv.getArgument(0));

        CongelamientoCamaraRequestDTO dto = new CongelamientoCamaraRequestDTO(
                20L, "Cámara A", LocalDateTime.now(), LocalDate.now().plusDays(5), EstadoInocuidadHaccp.RETENIDO
        );

        CongelamientoResponseDTO res = service.registrarCamara(dto);

        assertNotNull(res);
        assertEquals("CUARENTENA", res.getEstado());
    }

    @Test
    void testRegistrarDespachoRucFallback() {
        Procesamiento p = createDummyProcesamiento();

        Congelamiento c = new Congelamiento();
        c.setId(40L);
        c.setLoteOrigen(p);
        c.setEstado(CongelamientoEstado.APTO_PARA_EXPORTACION);

        when(congelamientoRepository.findById(40L)).thenReturn(Optional.of(c));
        when(despachoRepository.findByLote(c)).thenReturn(Optional.empty());
        when(despachoRepository.save(any(Despacho.class))).thenAnswer(inv -> inv.getArgument(0));

        when(rucService.consultarRuc("10456789123")).thenThrow(new RuntimeException("API Down"));

        DespachoRequestDTO dto = new DespachoRequestDTO(
                40L, "10456789123", "Mi Razón Social Fallback", "Callao",
                "BOOKING-999", "CONT-888", "SEAL-111", new BigDecimal("-20.0"),
                "DUS-222", "SANIPES-333", DespachoEstado.DESPACHADO_EN_TRANSITO
        );

        DespachoResponseDTO res = service.registrarDespacho(dto);

        assertNotNull(res);
        assertEquals("Mi Razón Social Fallback", res.getRazonSocialCliente());
        assertEquals("DESPACHADO_EN_TRANSITO", res.getEstado());
    }

    @Test
    void testRegistrarCamaraPericoHistaminaAlta() {
        Procesamiento p = createDummyProcesamiento();
        p.getLoteOrigen().getLoteOrigen().setEspecie(EspecieEnum.PERICO);

        Congelamiento c = new Congelamiento();
        c.setLoteOrigen(p);
        c.setTemperaturaCentroTermico(new BigDecimal("-20.0"));
        c.setEstado(CongelamientoEstado.EN_TUNEL);

        when(procesamientoRepository.findById(20L)).thenReturn(Optional.of(p));
        when(congelamientoRepository.findByLoteOrigen(p)).thenReturn(Optional.of(c));
        when(congelamientoRepository.save(any(Congelamiento.class))).thenAnswer(inv -> inv.getArgument(0));

        CongelamientoCamaraRequestDTO dto = new CongelamientoCamaraRequestDTO();
        dto.setLoteOrigenId(20L);
        dto.setCamaraDestino("Cámara A");
        dto.setFechaHoraIngresoCamara(LocalDateTime.now());
        dto.setFechaProgramadaDespacho(LocalDate.now().plusDays(5));
        dto.setEstadoInocuidadHACCP(EstadoInocuidadHaccp.APTO);
        dto.setNivelHistaminaPpm(new BigDecimal("55.5"));

        CongelamientoResponseDTO res = service.registrarCamara(dto);

        assertNotNull(res);
        assertEquals("NO_APTO_RETENIDO", res.getEstado());
    }

    @Test
    void testRegistrarCamaraPotaTvbnAlta() {
        Procesamiento p = createDummyProcesamiento();
        p.getLoteOrigen().getLoteOrigen().setEspecie(EspecieEnum.POTA);

        Congelamiento c = new Congelamiento();
        c.setLoteOrigen(p);
        c.setTemperaturaCentroTermico(new BigDecimal("-20.0"));
        c.setEstado(CongelamientoEstado.EN_TUNEL);

        when(procesamientoRepository.findById(20L)).thenReturn(Optional.of(p));
        when(congelamientoRepository.findByLoteOrigen(p)).thenReturn(Optional.of(c));
        when(congelamientoRepository.save(any(Congelamiento.class))).thenAnswer(inv -> inv.getArgument(0));

        CongelamientoCamaraRequestDTO dto = new CongelamientoCamaraRequestDTO();
        dto.setLoteOrigenId(20L);
        dto.setCamaraDestino("Cámara A");
        dto.setFechaHoraIngresoCamara(LocalDateTime.now());
        dto.setFechaProgramadaDespacho(LocalDate.now().plusDays(5));
        dto.setEstadoInocuidadHACCP(EstadoInocuidadHaccp.APTO);
        dto.setPruebaTvbn(new BigDecimal("35.0"));

        CongelamientoResponseDTO res = service.registrarCamara(dto);

        assertNotNull(res);
        assertEquals("NO_APTO_RETENIDO", res.getEstado());
    }

    @Test
    void testRegistrarCamaraMetalesRechazado() {
        Procesamiento p = createDummyProcesamiento();
        p.getLoteOrigen().getLoteOrigen().setEspecie(EspecieEnum.POTA);

        Congelamiento c = new Congelamiento();
        c.setLoteOrigen(p);
        c.setTemperaturaCentroTermico(new BigDecimal("-20.0"));
        c.setEstado(CongelamientoEstado.EN_TUNEL);

        when(procesamientoRepository.findById(20L)).thenReturn(Optional.of(p));
        when(congelamientoRepository.findByLoteOrigen(p)).thenReturn(Optional.of(c));
        when(congelamientoRepository.save(any(Congelamiento.class))).thenAnswer(inv -> inv.getArgument(0));

        CongelamientoCamaraRequestDTO dto = new CongelamientoCamaraRequestDTO();
        dto.setLoteOrigenId(20L);
        dto.setCamaraDestino("Cámara A");
        dto.setFechaHoraIngresoCamara(LocalDateTime.now());
        dto.setFechaProgramadaDespacho(LocalDate.now().plusDays(5));
        dto.setEstadoInocuidadHACCP(EstadoInocuidadHaccp.APTO);
        dto.setPasoDetectorMetales("Rechazado por Detección");

        CongelamientoResponseDTO res = service.registrarCamara(dto);

        assertNotNull(res);
        assertEquals("NO_APTO_RETENIDO", res.getEstado());
    }
}
