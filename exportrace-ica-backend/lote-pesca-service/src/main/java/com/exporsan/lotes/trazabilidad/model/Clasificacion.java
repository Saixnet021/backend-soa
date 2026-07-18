package com.exporsan.lotes.trazabilidad.model;

import com.exporsan.audit.HasId;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "clasificaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Clasificacion implements HasId {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_origen_id", nullable = false)
    private Recepcion loteOrigen;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluacionSensorialEnum evaluacionSensorial;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CalibreTallaEnum calibreTalla;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal kilosMermaDescarte;

    @Column
    private String motivoRechazo;

    @Column(nullable = false)
    private String nombreInspectorQA;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pesoUtil;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal mermaTotal;

    @Column(nullable = false)
    private String firmaQA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClasificacionEstado estado;
}
