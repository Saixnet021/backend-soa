package com.exporsan.certificacion.dto;

public class LoteDTO {

    private Long id;
    private String codigoLote;
    private String especie;
    private String nombreEmbarcacion;
    private Double pesoKg;
    private String estadoSanipes;
    private String estadoCadenaFrio;

    public LoteDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigoLote() { return codigoLote; }
    public void setCodigoLote(String codigoLote) { this.codigoLote = codigoLote; }

    public String getEspecie() { return especie; }
    public void setEspecie(String especie) { this.especie = especie; }

    public String getNombreEmbarcacion() { return nombreEmbarcacion; }
    public void setNombreEmbarcacion(String nombreEmbarcacion) { this.nombreEmbarcacion = nombreEmbarcacion; }

    public Double getPesoKg() { return pesoKg; }
    public void setPesoKg(Double pesoKg) { this.pesoKg = pesoKg; }

    public String getEstadoSanipes() { return estadoSanipes; }
    public void setEstadoSanipes(String estadoSanipes) { this.estadoSanipes = estadoSanipes; }

    public String getEstadoCadenaFrio() { return estadoCadenaFrio; }
    public void setEstadoCadenaFrio(String estadoCadenaFrio) { this.estadoCadenaFrio = estadoCadenaFrio; }
}
