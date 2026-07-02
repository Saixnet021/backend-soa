package com.exporsan.lote.soap;

import jakarta.xml.bind.annotation.*;
import java.math.BigDecimal;

@XmlAccessorType(XmlAccessType.FIELD)
public class EmbarcacionType {
    private Long id;
    private String nombreEmbarcacion;
    private String matricula;
    private String puertoBase;
    private BigDecimal capacidadToneladas;
    private String estado;
    private String nombreCapitan;
    private String licenciaCapitan;

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
}
