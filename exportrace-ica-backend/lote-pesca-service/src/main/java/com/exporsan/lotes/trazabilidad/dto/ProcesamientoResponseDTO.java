package com.exporsan.lotes.trazabilidad.dto;

import com.exporsan.lotes.trazabilidad.model.TipoCorteEnum;
import com.exporsan.lotes.trazabilidad.model.TipoEmpaqueEnum;
import com.exporsan.lotes.trazabilidad.model.TratamientoQuimicoEnum;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProcesamientoResponseDTO {
    private Long id;
    private ClasificacionResponseDTO loteOrigen;
    private TipoCorteEnum tipoCorte;
    private TratamientoQuimicoEnum tratamientoQuimico;
    private TipoEmpaqueEnum tipoEmpaque;
    private Integer cantidadBultosCajas;
    private BigDecimal pesoNetoFinal;
    private String lineaProceso;
    private String nombreSupervisor;
    private String idLoteProduccion;
    private BigDecimal porcentajeRendimiento;
    private String estado;
    private String colorHex;
    private String emoji;
}
