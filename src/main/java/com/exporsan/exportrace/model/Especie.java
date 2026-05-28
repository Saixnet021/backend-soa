package com.exporsan.exportrace.model;

import jakarta.persistence.*;

@Entity
@Table(name = "especie")
public class Especie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombreComun;
    private String nombreCientifico;
    private String codigoSanipes;
    private Boolean enVeda;
    private Double tempMinCritica;
    private Double tempMaxCritica;

    public Especie() {}

    public Especie(Long id, String nombreComun, String nombreCientifico, String codigoSanipes, Boolean enVeda, Double tempMinCritica, Double tempMaxCritica) {
        this.id = id;
        this.nombreComun = nombreComun;
        this.nombreCientifico = nombreCientifico;
        this.codigoSanipes = codigoSanipes;
        this.enVeda = enVeda;
        this.tempMinCritica = tempMinCritica;
        this.tempMaxCritica = tempMaxCritica;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreComun() { return nombreComun; }
    public void setNombreComun(String nombreComun) { this.nombreComun = nombreComun; }

    public String getNombreCientifico() { return nombreCientifico; }
    public void setNombreCientifico(String nombreCientifico) { this.nombreCientifico = nombreCientifico; }

    public String getCodigoSanipes() { return codigoSanipes; }
    public void setCodigoSanipes(String codigoSanipes) { this.codigoSanipes = codigoSanipes; }

    public Boolean getEnVeda() { return enVeda; }
    public void setEnVeda(Boolean enVeda) { this.enVeda = enVeda; }

    public Double getTempMinCritica() { return tempMinCritica; }
    public void setTempMinCritica(Double tempMinCritica) { this.tempMinCritica = tempMinCritica; }

    public Double getTempMaxCritica() { return tempMaxCritica; }
    public void setTempMaxCritica(Double tempMaxCritica) { this.tempMaxCritica = tempMaxCritica; }
}
