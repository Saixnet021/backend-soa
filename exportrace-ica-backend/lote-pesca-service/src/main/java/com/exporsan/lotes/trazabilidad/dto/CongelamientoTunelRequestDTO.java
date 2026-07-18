package com.exporsan.lotes.trazabilidad.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CongelamientoTunelRequestDTO {

    @NotNull(message = "El id de procesamiento de origen es requerido")
    private Long loteOrigenId;

    @NotBlank(message = "El número de túnel es requerido")
    private String numeroTunel;

    @NotNull(message = "La fecha/hora de ingreso al túnel es requerida")
    private LocalDateTime fechaHoraIngresoTunel;

    @NotNull(message = "La fecha/hora de salida del túnel es requerida")
    private LocalDateTime fechaHoraSalidaTunel;

    @NotNull(message = "La temperatura en centro térmico es requerida")
    private BigDecimal temperaturaCentroTermico;

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

    // Backward-compatible constructor for tests
    public CongelamientoTunelRequestDTO(Long loteOrigenId, String numeroTunel, LocalDateTime fechaHoraIngresoTunel, LocalDateTime fechaHoraSalidaTunel, BigDecimal temperaturaCentroTermico) {
        this.loteOrigenId = loteOrigenId;
        this.numeroTunel = numeroTunel;
        this.fechaHoraIngresoTunel = fechaHoraIngresoTunel;
        this.fechaHoraSalidaTunel = fechaHoraSalidaTunel;
        this.temperaturaCentroTermico = temperaturaCentroTermico;
    }
}
