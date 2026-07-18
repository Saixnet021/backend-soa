package com.exporsan.lotes.trazabilidad.dto;

import com.exporsan.lotes.trazabilidad.model.DespachoEstado;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DespachoRequestDTO {

    @NotNull(message = "El id del lote de congelamiento es requerido")
    private Long loteId;

    @NotBlank(message = "El RUC del cliente es requerido")
    @Size(min = 11, max = 11, message = "El RUC debe tener 11 dígitos")
    private String rucCliente;

    // Optional manual fallback
    private String razonSocialCliente;

    @NotBlank(message = "El puerto de destino es requerido")
    private String puertoDestino;

    @NotBlank(message = "La reserva naviera (Booking) es requerida")
    private String reservaNaviera;

    @NotBlank(message = "El número de contenedor frigorífico es requerido")
    private String numeroContenedorFrigorifico;

    @NotBlank(message = "Los precintos aduaneros/navieros son requeridos")
    private String precintosAduanerosNavieros;

    @NotNull(message = "La temperatura de seteo del contenedor es requerida")
    private BigDecimal temperaturaSeteoContenedor;

    @NotBlank(message = "El número de DUS es requerido")
    private String numeroDUS;

    @NotBlank(message = "El código de certificado sanitario (SANIPES) es requerido")
    private String codigoCertificadoSanitario;

    @NotNull(message = "El estado del despacho es requerido (STOCK_DISPONIBLE, DESPACHADO_EN_TRANSITO)")
    private DespachoEstado estado;
}
