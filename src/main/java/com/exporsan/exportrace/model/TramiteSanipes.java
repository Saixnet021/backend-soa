package com.exporsan.exportrace.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tramite_sanipes_chd")
public class TramiteSanipes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "fk_lote")
    private LotePesca lote;
    
    private LocalDateTime fechaSolicitud;
    private String estado;
    private String codigoCertificado;
    private String urlCertificado;

    public TramiteSanipes() {}

    public TramiteSanipes(Long id, LotePesca lote, LocalDateTime fechaSolicitud, String estado, String codigoCertificado, String urlCertificado) {
        this.id = id;
        this.lote = lote;
        this.fechaSolicitud = fechaSolicitud;
        this.estado = estado;
        this.codigoCertificado = codigoCertificado;
        this.urlCertificado = urlCertificado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LotePesca getLote() { return lote; }
    public void setLote(LotePesca lote) { this.lote = lote; }

    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCodigoCertificado() { return codigoCertificado; }
    public void setCodigoCertificado(String codigoCertificado) { this.codigoCertificado = codigoCertificado; }

    public String getUrlCertificado() { return urlCertificado; }
    public void setUrlCertificado(String urlCertificado) { this.urlCertificado = urlCertificado; }
}
