package com.exporsan.lotes.trazabilidad.dto;

import com.exporsan.lotes.trazabilidad.model.CalibreTallaEnum;
import com.exporsan.lotes.trazabilidad.model.EvaluacionSensorialEnum;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClasificacionResponseDTO {
    private Long id;
    private RecepcionResponseDTO loteOrigen;
    private EvaluacionSensorialEnum evaluacionSensorial;
    private CalibreTallaEnum calibreTalla;
    private BigDecimal kilosMermaDescarte;
    private String motivoRechazo;
    private String nombreInspectorQA;
    private BigDecimal pesoUtil;
    private BigDecimal mermaTotal;
    private String firmaQA;
    private String estado;
    private String colorHex;
    private String emoji;
}
