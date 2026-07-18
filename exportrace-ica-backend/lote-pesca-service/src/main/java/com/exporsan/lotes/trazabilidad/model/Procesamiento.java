package com.exporsan.lotes.trazabilidad.model;

import com.exporsan.audit.HasId;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "procesamientos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Procesamiento implements HasId {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_origen_id", nullable = false)
    private Clasificacion loteOrigen;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCorteEnum tipoCorte;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TratamientoQuimicoEnum tratamientoQuimico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEmpaqueEnum tipoEmpaque;

    @Column(nullable = false)
    private Integer cantidadBultosCajas;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pesoNetoFinal;

    @Column(nullable = false)
    private String lineaProceso;

    @Column(nullable = false)
    private String nombreSupervisor;

    @Column(nullable = false, unique = true)
    private String idLoteProduccion;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal porcentajeRendimiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcesamientoEstado estado;
}
