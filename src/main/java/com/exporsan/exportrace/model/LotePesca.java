package com.exporsan.exportrace.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lote_chd")
public class LotePesca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "fk_especie")
    private Especie especie;
    
    private String embarcacion;
    private Double pesoKg;
    private LocalDateTime fechaRecepcion;
    private String estadoSanipes;
    private String estadoFrio;
    private String estadoGeneral;

    public LotePesca() {}

    public LotePesca(Long id, Especie especie, String embarcacion, Double pesoKg, LocalDateTime fechaRecepcion, String estadoSanipes, String estadoFrio, String estadoGeneral) {
        this.id = id;
        this.especie = especie;
        this.embarcacion = embarcacion;
        this.pesoKg = pesoKg;
        this.fechaRecepcion = fechaRecepcion;
        this.estadoSanipes = estadoSanipes;
        this.estadoFrio = estadoFrio;
        this.estadoGeneral = estadoGeneral;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Especie getEspecie() { return especie; }
    public void setEspecie(Especie especie) { this.especie = especie; }

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
