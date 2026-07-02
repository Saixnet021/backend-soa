package com.exporsan.lotes.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "embarcaciones")
public class Embarcacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombreEmbarcacion;

    @Column(nullable = false, unique = true)
    private String matricula;

    private String puertoBase;

    private BigDecimal capacidadToneladas;

    private String estado;

    private String nombreCapitan;

    private String licenciaCapitan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empresa")
    @JsonIgnore
    private Empresa empresa;

    public Embarcacion() {
        this.estado = "ACTIVA";
    }

    @JsonProperty("idEmpresa")
    public Long getIdEmpresa() {
        return empresa != null ? empresa.getId() : null;
    }

    @JsonProperty("razonSocialEmpresa")
    public String getRazonSocialEmpresa() {
        return empresa != null ? empresa.getRazonSocial() : null;
    }

    @JsonProperty("rucEmpresa")
    public String getRucEmpresa() {
        return empresa != null ? empresa.getRuc() : null;
    }

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
    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }
}
