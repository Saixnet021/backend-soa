package com.exporsan.calidad.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_calidad")
public class AuditoriaCalidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idLote;

    private Long idInspector;

    private LocalDateTime timestampMedicion;

    private Double temperaturaCelsius;

    private String idCamara;

    private String observaciones;

    public AuditoriaCalidad() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdLote() { return idLote; }
    public void setIdLote(Long idLote) { this.idLote = idLote; }

    public Long getIdInspector() { return idInspector; }
    public void setIdInspector(Long idInspector) { this.idInspector = idInspector; }

    public LocalDateTime getTimestampMedicion() { return timestampMedicion; }
    public void setTimestampMedicion(LocalDateTime timestampMedicion) { this.timestampMedicion = timestampMedicion; }

    public Double getTemperaturaCelsius() { return temperaturaCelsius; }
    public void setTemperaturaCelsius(Double temperaturaCelsius) { this.temperaturaCelsius = temperaturaCelsius; }

    public String getIdCamara() { return idCamara; }
    public void setIdCamara(String idCamara) { this.idCamara = idCamara; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
