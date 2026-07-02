package com.exporsan.lotes.soap;

import jakarta.xml.bind.annotation.*;
import java.math.BigDecimal;

@XmlRootElement(name = "RegistrarEmbarcacionRequest", namespace = "http://exporsan.com/embarcaciones")
@XmlAccessorType(XmlAccessType.FIELD)
public class RegistrarEmbarcacionRequest {
    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String nombreEmbarcacion;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String matricula;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String puertoBase;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private BigDecimal capacidadToneladas;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String nombreCapitan;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private String licenciaCapitan;

    @XmlElement(namespace = "http://exporsan.com/embarcaciones")
    private Long idEmpresa;

    public String getNombreEmbarcacion() { return nombreEmbarcacion; }
    public void setNombreEmbarcacion(String nombreEmbarcacion) { this.nombreEmbarcacion = nombreEmbarcacion; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getPuertoBase() { return puertoBase; }
    public void setPuertoBase(String puertoBase) { this.puertoBase = puertoBase; }
    public BigDecimal getCapacidadToneladas() { return capacidadToneladas; }
    public void setCapacidadToneladas(BigDecimal capacidadToneladas) { this.capacidadToneladas = capacidadToneladas; }
    public String getNombreCapitan() { return nombreCapitan; }
    public void setNombreCapitan(String nombreCapitan) { this.nombreCapitan = nombreCapitan; }
    public String getLicenciaCapitan() { return licenciaCapitan; }
    public void setLicenciaCapitan(String licenciaCapitan) { this.licenciaCapitan = licenciaCapitan; }
    public Long getIdEmpresa() { return idEmpresa; }
    public void setIdEmpresa(Long idEmpresa) { this.idEmpresa = idEmpresa; }
}
