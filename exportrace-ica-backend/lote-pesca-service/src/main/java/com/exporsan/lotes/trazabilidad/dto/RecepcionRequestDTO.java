package com.exporsan.lotes.trazabilidad.dto;

import com.exporsan.lotes.trazabilidad.model.EspecieEnum;
import com.exporsan.lotes.trazabilidad.model.TurnoEnum;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecepcionRequestDTO {

    @NotBlank(message = "El número de DER es requerido")
    private String numeroDER;

    @NotBlank(message = "El nombre de la embarcación es requerido")
    private String nombreEmbarcacion;

    @NotBlank(message = "La matrícula es requerida")
    private String matriculaEmbarcacion;

    @NotNull(message = "La especie es requerida (POTA, PERICO)")
    private EspecieEnum especie;

    @NotNull(message = "El peso bruto es requerido")
    @DecimalMin(value = "0.1", message = "El peso bruto debe ser mayor a 0")
    private BigDecimal pesoBrutoBascula;

    @NotNull(message = "La temperatura de llegada es requerida")
    private BigDecimal temperaturaLlegada;

    @NotBlank(message = "La guía de remisión del remitente es requerida")
    private String guiaRemisionRemitente;

    @NotNull(message = "El turno es requerido (MAÑANA, TARDE, NOCHE)")
    private TurnoEnum turno;
}
