package com.exporsan.lotes.trazabilidad.dto;

import com.exporsan.lotes.trazabilidad.model.TipoCorteEnum;
import com.exporsan.lotes.trazabilidad.model.TipoEmpaqueEnum;
import com.exporsan.lotes.trazabilidad.model.TratamientoQuimicoEnum;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProcesamientoRequestDTO {

    @NotNull(message = "El id de clasificación de origen es requerido")
    private Long loteOrigenId;

    @NotNull(message = "El tipo de corte es requerido (FILETE, ANILLAS, ENTERO)")
    private TipoCorteEnum tipoCorte;

    @NotNull(message = "El tratamiento químico es requerido (ADITIVO, NATURAL)")
    private TratamientoQuimicoEnum tratamientoQuimico;

    @NotNull(message = "El tipo de empaque es requerido (SACO_20KG, CAJA_MASTER_10KG)")
    private TipoEmpaqueEnum tipoEmpaque;

    @NotNull(message = "La cantidad de bultos/cajas es requerida")
    @Min(value = 1, message = "La cantidad de bultos/cajas debe ser al menos 1")
    private Integer cantidadBultosCajas;

    @NotNull(message = "El peso neto final es requerido")
    @DecimalMin(value = "0.1", message = "El peso neto final debe ser mayor a 0")
    private BigDecimal pesoNetoFinal;

    @NotBlank(message = "La línea de proceso es requerida")
    private String lineaProceso;
}
