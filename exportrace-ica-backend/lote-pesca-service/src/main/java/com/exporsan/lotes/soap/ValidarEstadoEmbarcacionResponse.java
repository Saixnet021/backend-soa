package com.exporsan.lotes.soap;

import jakarta.xml.bind.annotation.*;

@XmlRootElement(name = "ValidarEstadoEmbarcacionResponse", namespace = "http://exporsan.com/embarcaciones")
@XmlAccessorType(XmlAccessType.FIELD)
public class ValidarEstadoEmbarcacionResponse {
    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String matricula;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String nombreEmbarcacion;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String puertoBase;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String estado;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private boolean habilitada;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String mensaje;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private Long idEmpresa;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String razonSocialEmpresa;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String rucEmpresa;

    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getNombreEmbarcacion() { return nombreEmbarcacion; }
    public void setNombreEmbarcacion(String nombreEmbarcacion) { this.nombreEmbarcacion = nombreEmbarcacion; }
    public String getPuertoBase() { return puertoBase; }
    public void setPuertoBase(String puertoBase) { this.puertoBase = puertoBase; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public boolean isHabilitada() { return habilitada; }
    public void setHabilitada(boolean habilitada) { this.habilitada = habilitada; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public Long getIdEmpresa() { return idEmpresa; }
    public void setIdEmpresa(Long idEmpresa) { this.idEmpresa = idEmpresa; }
    public String getRazonSocialEmpresa() { return razonSocialEmpresa; }
    public void setRazonSocialEmpresa(String razonSocialEmpresa) { this.razonSocialEmpresa = razonSocialEmpresa; }
    public String getRucEmpresa() { return rucEmpresa; }
    public void setRucEmpresa(String rucEmpresa) { this.rucEmpresa = rucEmpresa; }
}
