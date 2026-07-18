package com.exporsan.lotes.trazabilidad.model;

import com.exporsan.audit.HasId;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "despachos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Despacho implements HasId {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_congelamiento_id", nullable = false)
    private Congelamiento lote;

    @Column(nullable = false)
    private String rucCliente;

    @Column(nullable = false)
    private String razonSocialCliente;

    @Column(nullable = false)
    private String puertoDestino;

    @Column(nullable = false)
    private String reservaNaviera;

    @Column(nullable = false)
    private String numeroContenedorFrigorifico;

    @Column(nullable = false)
    private String precintosAduanerosNavieros;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal temperaturaSeteoContenedor;

    @Column(nullable = false)
    private String numeroDUS;

    @Column(nullable = false)
    private String codigoCertificadoSanitario;

    @Column(nullable = false)
    private String nombreDespachador;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DespachoEstado estado;
}
