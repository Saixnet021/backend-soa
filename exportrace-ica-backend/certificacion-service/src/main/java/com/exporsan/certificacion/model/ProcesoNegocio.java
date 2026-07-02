package com.exporsan.certificacion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "procesos_negocio")
public class ProcesoNegocio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipoProceso;

    @Column(nullable = false)
    private Long loteId;

    private Long tramiteId;

    @Column(nullable = false)
    private String estado;

    private String subEstado;

    @Column(columnDefinition = "TEXT")
    private String datosContexto;

    @Column(columnDefinition = "TEXT")
    private String resultado;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    private LocalDateTime fechaLimite;

    private String notificado;

    public ProcesoNegocio() {
        this.estado = "INICIADO";
        this.fechaInicio = LocalDateTime.now();
        this.notificado = "NO";
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTipoProceso() { return tipoProceso; }
    public void setTipoProceso(String tipoProceso) { this.tipoProceso = tipoProceso; }
    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }
    public Long getTramiteId() { return tramiteId; }
    public void setTramiteId(Long tramiteId) { this.tramiteId = tramiteId; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getSubEstado() { return subEstado; }
    public void setSubEstado(String subEstado) { this.subEstado = subEstado; }
    public String getDatosContexto() { return datosContexto; }
    public void setDatosContexto(String datosContexto) { this.datosContexto = datosContexto; }
    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }
    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }
    public LocalDateTime getFechaLimite() { return fechaLimite; }
    public void setFechaLimite(LocalDateTime fechaLimite) { this.fechaLimite = fechaLimite; }
    public String getNotificado() { return notificado; }
    public void setNotificado(String notificado) { this.notificado = notificado; }
}
