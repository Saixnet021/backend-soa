package com.exporsan.lotes.trazabilidad.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DespachoResponseDTO {
    private Long id;
    private CongelamientoResponseDTO lote;
    private String rucCliente;
    private String razonSocialCliente;
    private String puertoDestino;
    private String reservaNaviera;
    private String numeroContenedorFrigorifico;
    private String precintosAduanerosNavieros;
    private BigDecimal temperaturaSeteoContenedor;
    private String numeroDUS;
    private String codigoCertificadoSanitario;
    private String nombreDespachador;
    private String estado;
    private String colorHex;
    private String emoji;
}
