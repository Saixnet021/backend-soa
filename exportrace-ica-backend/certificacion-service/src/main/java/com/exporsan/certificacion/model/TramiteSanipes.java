package com.exporsan.certificacion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tramite_sanipes")
public class TramiteSanipes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idLote;

    private LocalDateTime fechaSolicitud;

    private String estadoTramite;

    private String numeroCertificado;

    private String observacionSanipes;

    private LocalDateTime fechaAprobacion;

    public TramiteSanipes() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdLote() { return idLote; }
    public void setIdLote(Long idLote) { this.idLote = idLote; }

    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public String getEstadoTramite() { return estadoTramite; }
    public void setEstadoTramite(String estadoTramite) { this.estadoTramite = estadoTramite; }

    public String getNumeroCertificado() { return numeroCertificado; }
    public void setNumeroCertificado(String numeroCertificado) { this.numeroCertificado = numeroCertificado; }

    public String getObservacionSanipes() { return observacionSanipes; }
    public void setObservacionSanipes(String observacionSanipes) { this.observacionSanipes = observacionSanipes; }

    public LocalDateTime getFechaAprobacion() { return fechaAprobacion; }
    public void setFechaAprobacion(LocalDateTime fechaAprobacion) { this.fechaAprobacion = fechaAprobacion; }
}
