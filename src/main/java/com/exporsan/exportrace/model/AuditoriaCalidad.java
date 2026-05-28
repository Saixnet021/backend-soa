package com.exporsan.exportrace.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_calidad_chd")
public class AuditoriaCalidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "fk_lote")
    private LotePesca lote;
    
    private String inspectorNombre;
    private LocalDateTime timestampMedicion;
    private Double temperaturaC;
    private String observaciones;
    private Boolean dentroRango;

    public AuditoriaCalidad() {}

    public AuditoriaCalidad(Long id, LotePesca lote, String inspectorNombre, LocalDateTime timestampMedicion, Double temperaturaC, String observaciones, Boolean dentroRango) {
        this.id = id;
        this.lote = lote;
        this.inspectorNombre = inspectorNombre;
        this.timestampMedicion = timestampMedicion;
        this.temperaturaC = temperaturaC;
        this.observaciones = observaciones;
        this.dentroRango = dentroRango;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LotePesca getLote() { return lote; }
    public void setLote(LotePesca lote) { this.lote = lote; }

    public String getInspectorNombre() { return inspectorNombre; }
    public void setInspectorNombre(String inspectorNombre) { this.inspectorNombre = inspectorNombre; }

    public LocalDateTime getTimestampMedicion() { return timestampMedicion; }
    public void setTimestampMedicion(LocalDateTime timestampMedicion) { this.timestampMedicion = timestampMedicion; }

    public Double getTemperaturaC() { return temperaturaC; }
    public void setTemperaturaC(Double temperaturaC) { this.temperaturaC = temperaturaC; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Boolean getDentroRango() { return dentroRango; }
    public void setDentroRango(Boolean dentroRango) { this.dentroRango = dentroRango; }
}
