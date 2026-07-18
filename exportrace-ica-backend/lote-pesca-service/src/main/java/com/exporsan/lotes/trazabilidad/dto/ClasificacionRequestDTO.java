package com.exporsan.lotes.trazabilidad.dto;

import com.exporsan.lotes.trazabilidad.model.CalibreTallaEnum;
import com.exporsan.lotes.trazabilidad.model.ClasificacionEstado;
import com.exporsan.lotes.trazabilidad.model.EvaluacionSensorialEnum;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClasificacionRequestDTO {

    @NotNull(message = "El id del ticket de recepción es requerido")
    private Long loteOrigenId;

    @NotNull(message = "La evaluación sensorial es requerida (FIRME, OLOR_CARACTERISTICO, COLOR_NORMAL)")
    private EvaluacionSensorialEnum evaluacionSensorial;

    @NotNull(message = "La talla/calibre es requerida (S, M, L, XL, MIXTO)")
    private CalibreTallaEnum calibreTalla;

    @NotNull(message = "Los kilos de merma/descarte son requeridos")
    @DecimalMin(value = "0.0", message = "La merma debe ser mayor o igual a 0")
    private BigDecimal kilosMermaDescarte;

    private String motivoRechazo;

    @NotBlank(message = "La firma del inspector de calidad es requerida")
    private String firmaQA;

    @NotNull(message = "El estado es requerido (APROBADO_CORTE, RECHAZADO_TOTAL, OBSERVADO)")
    private ClasificacionEstado estado;
}
