package com.exporsan.lotes.trazabilidad.model;

import com.exporsan.audit.HasId;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "congelamientos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Congelamiento implements HasId {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_origen_id", nullable = false)
    private Procesamiento loteOrigen;

    // Paso 1 - Tunel
    @Column(nullable = false)
    private String numeroTunel;

    @Column(nullable = false)
    private LocalDateTime fechaHoraIngresoTunel;

    @Column(nullable = false)
    private LocalDateTime fechaHoraSalidaTunel;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal temperaturaCentroTermico;

    @Column
    private String nombreOperarioTunel;

    @Column
    private String nombreInspectorQAFrio;

    // Phase 4.1
    @Column
    private String metodoCongelamiento;

    @Column
    private String numeroEquipoFrio;

    // Phase 4.2
    @Column(precision = 5, scale = 2)
    private BigDecimal porcentajeGlaseado;

    @Column
    private String tipoEmpaquePrimario;

    @Column
    private String tipoEmpaqueSecundario;

    @Column(precision = 10, scale = 2)
    private BigDecimal pesoBrutoCaja;

    @Column(precision = 10, scale = 2)
    private BigDecimal pesoNetoDeclarado;

    @Column
    private Integer cantidadCajasFinales;

    @Column
    private Boolean zunchoSeguridad;

    // Phase 4.3 - Metal Detector
    @Column
    private String pasoDetectorMetales;

    @Column
    private Boolean pruebaPatronDetector;

    @Column
    private String operarioDetector;

    // Phase 4.4 - Lab Controls
    @Column(precision = 8, scale = 2)
    private BigDecimal nivelHistaminaPpm;

    @Column(precision = 8, scale = 2)
    private BigDecimal pruebaTvbn;

    @Column
    private String saborResidualAcido;

    @Column
    private String analisisMicrobiologico;

    // Phase 4.5 - Logistics
    @Column
    private String tipoPallet;

    @Column
    private String ubicacionRack;

    @Column
    private String estadoLiberacionHaccp;

    // Paso 2 - Camara
    @Column
    private String camaraDestino;

    @Column
    private LocalDateTime fechaHoraIngresoCamara;

    @Column
    private LocalDate fechaProgramadaDespacho;

    @Enumerated(EnumType.STRING)
    @Column
    private EstadoInocuidadHaccp estadoInocuidadHACCP;

    @Column
    private LocalDate fechaVencimiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CongelamientoEstado estado;
}
