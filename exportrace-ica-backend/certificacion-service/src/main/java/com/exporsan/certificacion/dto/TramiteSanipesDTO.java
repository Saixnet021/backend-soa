package com.exporsan.certificacion.dto;

public class TramiteSanipesDTO {

    private Long idTramite;
    private String estadoTramite;
    private String numeroCertificado;
    private Long idLote;

    public TramiteSanipesDTO() {
    }

    public TramiteSanipesDTO(Long idTramite, String estadoTramite, String numeroCertificado, Long idLote) {
        this.idTramite = idTramite;
        this.estadoTramite = estadoTramite;
        this.numeroCertificado = numeroCertificado;
        this.idLote = idLote;
    }

    public Long getIdTramite() { return idTramite; }
    public void setIdTramite(Long idTramite) { this.idTramite = idTramite; }

    public String getEstadoTramite() { return estadoTramite; }
    public void setEstadoTramite(String estadoTramite) { this.estadoTramite = estadoTramite; }

    public String getNumeroCertificado() { return numeroCertificado; }
    public void setNumeroCertificado(String numeroCertificado) { this.numeroCertificado = numeroCertificado; }

    public Long getIdLote() { return idLote; }
    public void setIdLote(Long idLote) { this.idLote = idLote; }
}
