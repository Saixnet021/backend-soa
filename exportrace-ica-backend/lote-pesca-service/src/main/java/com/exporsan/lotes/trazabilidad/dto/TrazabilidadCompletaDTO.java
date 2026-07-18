package com.exporsan.lotes.trazabilidad.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrazabilidadCompletaDTO {
    private RecepcionResponseDTO recepcion;
    private ClasificacionResponseDTO clasificacion;
    private ProcesamientoResponseDTO procesamiento;
    private CongelamientoResponseDTO congelamiento;
    private DespachoResponseDTO despacho;
}
