package com.exporsan.lotes.trazabilidad.model;

import com.exporsan.audit.HasId;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recepciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Recepcion implements HasId {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTicket;

    @Column(nullable = false)
    private String numeroDER;

    @Column(nullable = false)
    private String nombreEmbarcacion;

    @Column(nullable = false)
    private String matriculaEmbarcacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EspecieEnum especie;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pesoBrutoBascula;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal temperaturaLlegada;

    @Column(nullable = false)
    private String guiaRemisionRemitente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TurnoEnum turno;

    @Column(nullable = false)
    private String nombreResponsable;

    @Column(nullable = false)
    private LocalDateTime fechaHoraIngreso;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecepcionEstado estado;

    @Override
    public Long getId() {
        return idTicket;
    }
}
