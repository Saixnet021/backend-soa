package com.exporsan.lotes.trazabilidad.dto;

import com.exporsan.lotes.trazabilidad.model.EspecieEnum;
import com.exporsan.lotes.trazabilidad.model.TurnoEnum;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecepcionResponseDTO {
    private Long idTicket;
    private String numeroDER;
    private String nombreEmbarcacion;
    private String matriculaEmbarcacion;
    private EspecieEnum especie;
    private BigDecimal pesoBrutoBascula;
    private BigDecimal temperaturaLlegada;
    private String guiaRemisionRemitente;
    private TurnoEnum turno;
    private String nombreResponsable;
    private LocalDateTime fechaHoraIngreso;
    private String estado;
    private String colorHex;
    private String emoji;
}
