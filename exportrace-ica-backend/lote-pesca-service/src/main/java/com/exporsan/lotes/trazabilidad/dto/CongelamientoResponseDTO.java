package com.exporsan.lotes.trazabilidad.dto;

import com.exporsan.lotes.trazabilidad.model.EstadoInocuidadHaccp;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CongelamientoResponseDTO {
    private Long id;
    private ProcesamientoResponseDTO loteOrigen;

    // Tunel
    private String numeroTunel;
    private LocalDateTime fechaHoraIngresoTunel;
    private LocalDateTime fechaHoraSalidaTunel;
    private BigDecimal temperaturaCentroTermico;
    private String nombreOperarioTunel;
    private String nombreInspectorQAFrio;

    // Phase 4.1 & 4.2 fields
    private String metodoCongelamiento;
    private String numeroEquipoFrio;
    private BigDecimal porcentajeGlaseado;
    private String tipoEmpaquePrimario;
    private String tipoEmpaqueSecundario;
    private BigDecimal pesoBrutoCaja;
    private BigDecimal pesoNetoDeclarado;
    private Integer cantidadCajasFinales;
    private Boolean zunchoSeguridad;

    // Phase 4.3 - Metal Detector
    private String pasoDetectorMetales;
    private Boolean pruebaPatronDetector;
    private String operarioDetector;

    // Phase 4.4 - Quality Lab Controls
    private BigDecimal nivelHistaminaPpm;
    private BigDecimal pruebaTvbn;
    private String saborResidualAcido;
    private String analisisMicrobiologico;

    // Phase 4.5 - Logistics / Storing
    private String tipoPallet;
    private String ubicacionRack;
    private String estadoLiberacionHaccp;

    // Camara
    private String camaraDestino;
    private LocalDateTime fechaHoraIngresoCamara;
    private LocalDate fechaProgramadaDespacho;
    private EstadoInocuidadHaccp estadoInocuidadHACCP;
    private LocalDate fechaVencimiento;

    // Estado
    private String estado;
    private String colorHex;
    private String emoji;
}
