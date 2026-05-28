package com.exporsan.exportrace.dto;

import java.time.LocalDateTime;

public class LoteCanonicoDTO {
    private Long id;
    private String especie;
    private String codigoSanipesEspecie;
    private String embarcacion;
    private Double pesoKg;
    private LocalDateTime fechaRecepcion;
    private String estadoSanipes;
    private String estadoFrio;
    private String estadoGeneral;

    public LoteCanonicoDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEspecie() { return especie; }
    public void setEspecie(String especie) { this.especie = especie; }

    public String getCodigoSanipesEspecie() { return codigoSanipesEspecie; }
    public void setCodigoSanipesEspecie(String codigoSanipesEspecie) { this.codigoSanipesEspecie = codigoSanipesEspecie; }

    public String getEmbarcacion() { return embarcacion; }
    public void setEmbarcacion(String embarcacion) { this.embarcacion = embarcacion; }

    public Double getPesoKg() { return pesoKg; }
    public void setPesoKg(Double pesoKg) { this.pesoKg = pesoKg; }

    public LocalDateTime getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(LocalDateTime fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public String getEstadoSanipes() { return estadoSanipes; }
    public void setEstadoSanipes(String estadoSanipes) { this.estadoSanipes = estadoSanipes; }

    public String getEstadoFrio() { return estadoFrio; }
    public void setEstadoFrio(String estadoFrio) { this.estadoFrio = estadoFrio; }

    public String getEstadoGeneral() { return estadoGeneral; }
    public void setEstadoGeneral(String estadoGeneral) { this.estadoGeneral = estadoGeneral; }
}
