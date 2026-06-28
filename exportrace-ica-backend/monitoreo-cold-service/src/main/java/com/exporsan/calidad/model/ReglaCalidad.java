package com.exporsan.calidad.model;

import jakarta.persistence.*;

@Entity
@Table(name = "regla_calidad")
public class ReglaCalidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigoEspecie;

    private Double tempMinAlerta;

    private Double tempMaxAlerta;

    private String accionAlerta;

    public ReglaCalidad() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigoEspecie() { return codigoEspecie; }
    public void setCodigoEspecie(String codigoEspecie) { this.codigoEspecie = codigoEspecie; }

    public Double getTempMinAlerta() { return tempMinAlerta; }
    public void setTempMinAlerta(Double tempMinAlerta) { this.tempMinAlerta = tempMinAlerta; }

    public Double getTempMaxAlerta() { return tempMaxAlerta; }
    public void setTempMaxAlerta(Double tempMaxAlerta) { this.tempMaxAlerta = tempMaxAlerta; }

    public String getAccionAlerta() { return accionAlerta; }
    public void setAccionAlerta(String accionAlerta) { this.accionAlerta = accionAlerta; }
}
