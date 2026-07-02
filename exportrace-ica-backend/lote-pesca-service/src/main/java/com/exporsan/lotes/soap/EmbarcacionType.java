package com.exporsan.lotes.soap;

import jakarta.xml.bind.annotation.*;
import java.math.BigDecimal;

@XmlAccessorType(XmlAccessType.FIELD)
public class EmbarcacionType {
    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private Long id;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String nombreEmbarcacion;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String matricula;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String puertoBase;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private BigDecimal capacidadToneladas;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String estado;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String nombreCapitan;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String licenciaCapitan;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private Long idEmpresa;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String razonSocialEmpresa;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String rucEmpresa;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombreEmbarcacion() { return nombreEmbarcacion; }
    public void setNombreEmbarcacion(String nombreEmbarcacion) { this.nombreEmbarcacion = nombreEmbarcacion; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getPuertoBase() { return puertoBase; }
    public void setPuertoBase(String puertoBase) { this.puertoBase = puertoBase; }
    public BigDecimal getCapacidadToneladas() { return capacidadToneladas; }
    public void setCapacidadToneladas(BigDecimal capacidadToneladas) { this.capacidadToneladas = capacidadToneladas; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getNombreCapitan() { return nombreCapitan; }
    public void setNombreCapitan(String nombreCapitan) { this.nombreCapitan = nombreCapitan; }
    public String getLicenciaCapitan() { return licenciaCapitan; }
    public void setLicenciaCapitan(String licenciaCapitan) { this.licenciaCapitan = licenciaCapitan; }
    public Long getIdEmpresa() { return idEmpresa; }
    public void setIdEmpresa(Long idEmpresa) { this.idEmpresa = idEmpresa; }
    public String getRazonSocialEmpresa() { return razonSocialEmpresa; }
    public void setRazonSocialEmpresa(String razonSocialEmpresa) { this.razonSocialEmpresa = razonSocialEmpresa; }
    public String getRucEmpresa() { return rucEmpresa; }
    public void setRucEmpresa(String rucEmpresa) { this.rucEmpresa = rucEmpresa; }
}
