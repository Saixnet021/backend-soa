package com.exporsan.lotes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lote_chd")
public class LotePesca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigoLote;

    @Column(nullable = false)
    private String especie;

    private String nombreEmbarcacion;

    private Double pesoKg;

    private LocalDateTime fechaRecepcion;

    private String estadoSanipes;

    private String estadoCadenaFrio;

    public LotePesca() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoLote() {
        return codigoLote;
    }

    public void setCodigoLote(String codigoLote) {
        this.codigoLote = codigoLote;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public String getNombreEmbarcacion() {
        return nombreEmbarcacion;
    }

    public void setNombreEmbarcacion(String nombreEmbarcacion) {
        this.nombreEmbarcacion = nombreEmbarcacion;
    }

    public Double getPesoKg() {
        return pesoKg;
    }

    public void setPesoKg(Double pesoKg) {
        this.pesoKg = pesoKg;
    }

    public LocalDateTime getFechaRecepcion() {
        return fechaRecepcion;
    }

    public void setFechaRecepcion(LocalDateTime fechaRecepcion) {
        this.fechaRecepcion = fechaRecepcion;
    }

    public String getEstadoSanipes() {
        return estadoSanipes;
    }

    public void setEstadoSanipes(String estadoSanipes) {
        this.estadoSanipes = estadoSanipes;
    }

    public String getEstadoCadenaFrio() {
        return estadoCadenaFrio;
    }

    public void setEstadoCadenaFrio(String estadoCadenaFrio) {
        this.estadoCadenaFrio = estadoCadenaFrio;
    }
}
