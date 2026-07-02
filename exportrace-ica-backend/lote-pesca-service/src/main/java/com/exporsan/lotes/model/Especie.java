package com.exporsan.lotes.model;

import com.exporsan.audit.HasId;
import jakarta.persistence.*;

@Entity
@Table(name = "especie")
public class Especie implements HasId {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigoSanipes;

    @Column(nullable = false)
    private String nombreComun;

    private String nombreCientifico;

    private Double tempMinCelsius;

    private Double tempMaxCelsius;

    private Boolean enVeda;

    public Especie() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoSanipes() {
        return codigoSanipes;
    }

    public void setCodigoSanipes(String codigoSanipes) {
        this.codigoSanipes = codigoSanipes;
    }

    public String getNombreComun() {
        return nombreComun;
    }

    public void setNombreComun(String nombreComun) {
        this.nombreComun = nombreComun;
    }

    public String getNombreCientifico() {
        return nombreCientifico;
    }

    public void setNombreCientifico(String nombreCientifico) {
        this.nombreCientifico = nombreCientifico;
    }

    public Double getTempMinCelsius() {
        return tempMinCelsius;
    }

    public void setTempMinCelsius(Double tempMinCelsius) {
        this.tempMinCelsius = tempMinCelsius;
    }

    public Double getTempMaxCelsius() {
        return tempMaxCelsius;
    }

    public void setTempMaxCelsius(Double tempMaxCelsius) {
        this.tempMaxCelsius = tempMaxCelsius;
    }

    public Boolean getEnVeda() {
        return enVeda;
    }

    public void setEnVeda(Boolean enVeda) {
        this.enVeda = enVeda;
    }
}
