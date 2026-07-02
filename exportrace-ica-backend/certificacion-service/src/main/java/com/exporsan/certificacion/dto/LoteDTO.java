package com.exporsan.certificacion.dto;

public class LoteDTO {

    private Long id;
    private String codigoLote;
    private String especie;
    private String nombreEmbarcacion;
    private String matriculaEmbarcacion;
    private String capitanEmbarcacion;
    private String empresaRazonSocial;
    private String empresaRuc;
    private Double pesoKg;
    private String estadoSanipes;
    private String estadoCadenaFrio;
    private String fechaRecepcion;
    private String fechaSalidaLote;

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

    public String getMatriculaEmbarcacion() { return matriculaEmbarcacion; }
    public void setMatriculaEmbarcacion(String matriculaEmbarcacion) { this.matriculaEmbarcacion = matriculaEmbarcacion; }

    public String getCapitanEmbarcacion() { return capitanEmbarcacion; }
    public void setCapitanEmbarcacion(String capitanEmbarcacion) { this.capitanEmbarcacion = capitanEmbarcacion; }

    public String getEmpresaRazonSocial() { return empresaRazonSocial; }
    public void setEmpresaRazonSocial(String empresaRazonSocial) { this.empresaRazonSocial = empresaRazonSocial; }

    public String getEmpresaRuc() { return empresaRuc; }
    public void setEmpresaRuc(String empresaRuc) { this.empresaRuc = empresaRuc; }

    public Double getPesoKg() { return pesoKg; }
    public void setPesoKg(Double pesoKg) { this.pesoKg = pesoKg; }

    public String getEstadoSanipes() { return estadoSanipes; }
    public void setEstadoSanipes(String estadoSanipes) { this.estadoSanipes = estadoSanipes; }

    public String getEstadoCadenaFrio() { return estadoCadenaFrio; }
    public void setEstadoCadenaFrio(String estadoCadenaFrio) { this.estadoCadenaFrio = estadoCadenaFrio; }

    public String getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(String fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public String getFechaSalidaLote() { return fechaSalidaLote; }
    public void setFechaSalidaLote(String fechaSalidaLote) { this.fechaSalidaLote = fechaSalidaLote; }
}
