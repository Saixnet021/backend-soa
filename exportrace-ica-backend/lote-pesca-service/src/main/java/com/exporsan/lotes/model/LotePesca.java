package com.exporsan.lotes.model;

import com.exporsan.audit.HasId;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonSetter;

@Entity
@Table(name = "lote_chd")
public class LotePesca implements HasId {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigoLote;

    @Column(nullable = false)
    private String especie;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_embarcacion")
    @JsonIgnore
    private Embarcacion embarcacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empresa")
    @JsonIgnore
    private Empresa empresa;

    private Double pesoKg;

    private LocalDateTime fechaRecepcion;

    private String estadoSanipes;

    private String estadoCadenaFrio;

    @Column(nullable = true)
    private LocalDateTime fechaSalidaLote;

    @Transient
    private String nombreEmbarcacionInput;

    @Transient
    private String empresaRucInput;

    public LotePesca() {
    }

    @JsonProperty("nombreEmbarcacion")
    public String getNombreEmbarcacion() {
        if (embarcacion != null) return embarcacion.getNombreEmbarcacion();
        return nombreEmbarcacionInput;
    }

    @JsonSetter("nombreEmbarcacion")
    public void setNombreEmbarcacion(String nombre) {
        this.nombreEmbarcacionInput = nombre;
    }

    @JsonProperty("matriculaEmbarcacion")
    public String getMatriculaEmbarcacion() {
        return embarcacion != null ? embarcacion.getMatricula() : null;
    }

    @JsonProperty("capitanEmbarcacion")
    public String getCapitanEmbarcacion() {
        return embarcacion != null ? embarcacion.getNombreCapitan() : null;
    }

    @JsonProperty("idEmbarcacion")
    public Long getIdEmbarcacion() {
        return embarcacion != null ? embarcacion.getId() : null;
    }

    @JsonProperty("empresaRazonSocial")
    public String getEmpresaRazonSocial() {
        return empresa != null ? empresa.getRazonSocial() : null;
    }

    @JsonProperty("empresaRuc")
    public String getEmpresaRuc() {
        if (empresa != null) return empresa.getRuc();
        return empresaRucInput;
    }

    @JsonSetter("empresaRuc")
    public void setEmpresaRuc(String ruc) {
        this.empresaRucInput = ruc;
    }

    @JsonProperty("idEmpresa")
    public Long getIdEmpresa() {
        return empresa != null ? empresa.getId() : null;
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

    public Embarcacion getEmbarcacion() {
        return embarcacion;
    }

    public void setEmbarcacion(Embarcacion embarcacion) {
        this.embarcacion = embarcacion;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
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

    public LocalDateTime getFechaSalidaLote() {
        return fechaSalidaLote;
    }

    public void setFechaSalidaLote(LocalDateTime fechaSalidaLote) {
        this.fechaSalidaLote = fechaSalidaLote;
    }
}
