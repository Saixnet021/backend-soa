package com.exporsan.lotes.model;

import com.exporsan.audit.HasId;
import jakarta.persistence.*;
import java.time.LocalDateTime;

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

    private String nombreEmbarcacion;

    @Column(length = 20)
    private String matriculaEmbarcacion;

    private String capitanEmbarcacion;

    private String empresaRazonSocial;

    @Column(length = 11)
    private String empresaRuc;

    private Double pesoKg;

    private LocalDateTime fechaRecepcion;

    private String estadoSanipes;

    private String estadoCadenaFrio;

    @Column(nullable = true)
    private LocalDateTime fechaSalidaLote;

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

    public String getMatriculaEmbarcacion() {
        return matriculaEmbarcacion;
    }

    public void setMatriculaEmbarcacion(String matriculaEmbarcacion) {
        this.matriculaEmbarcacion = matriculaEmbarcacion;
    }

    public String getCapitanEmbarcacion() {
        return capitanEmbarcacion;
    }

    public void setCapitanEmbarcacion(String capitanEmbarcacion) {
        this.capitanEmbarcacion = capitanEmbarcacion;
    }

    public String getEmpresaRazonSocial() {
        return empresaRazonSocial;
    }

    public void setEmpresaRazonSocial(String empresaRazonSocial) {
        this.empresaRazonSocial = empresaRazonSocial;
    }

    public String getEmpresaRuc() {
        return empresaRuc;
    }

    public void setEmpresaRuc(String empresaRuc) {
        this.empresaRuc = empresaRuc;
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
