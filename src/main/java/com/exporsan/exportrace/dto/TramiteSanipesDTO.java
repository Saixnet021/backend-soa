package com.exporsan.exportrace.dto;

import java.time.LocalDateTime;

public class TramiteSanipesDTO {
    private Long id;
    private Long idLote;
    private String estado;
    private String codigoCertificado;
    private String urlCertificado;
    private LocalDateTime fechaSolicitud;

    public TramiteSanipesDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdLote() { return idLote; }
    public void setIdLote(Long idLote) { this.idLote = idLote; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCodigoCertificado() { return codigoCertificado; }
    public void setCodigoCertificado(String codigoCertificado) { this.codigoCertificado = codigoCertificado; }

    public String getUrlCertificado() { return urlCertificado; }
    public void setUrlCertificado(String urlCertificado) { this.urlCertificado = urlCertificado; }

    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }
}
