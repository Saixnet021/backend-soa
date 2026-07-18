package com.exporsan.lotes.trazabilidad.dto;

import com.exporsan.lotes.trazabilidad.model.EstadoInocuidadHaccp;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CongelamientoCamaraRequestDTO {

    @NotNull(message = "El id de procesamiento de origen es requerido")
    private Long loteOrigenId;

    @NotBlank(message = "La cámara de destino es requerida")
    private String camaraDestino;

    @NotNull(message = "La fecha/hora de ingreso a la cámara es requerida")
    private LocalDateTime fechaHoraIngresoCamara;

    @NotNull(message = "La fecha programada de despacho es requerida")
    private LocalDate fechaProgramadaDespacho;

    @NotNull(message = "El estado de inocuidad HACCP es requerido (APTO, RETENIDO)")
    private EstadoInocuidadHaccp estadoInocuidadHACCP;

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

    // Backward-compatible constructor for tests
    public CongelamientoCamaraRequestDTO(Long loteOrigenId, String camaraDestino, LocalDateTime fechaHoraIngresoCamara, LocalDate fechaProgramadaDespacho, EstadoInocuidadHaccp estadoInocuidadHACCP) {
        this.loteOrigenId = loteOrigenId;
        this.camaraDestino = camaraDestino;
        this.fechaHoraIngresoCamara = fechaHoraIngresoCamara;
        this.fechaProgramadaDespacho = fechaProgramadaDespacho;
        this.estadoInocuidadHACCP = estadoInocuidadHACCP;
    }
}
