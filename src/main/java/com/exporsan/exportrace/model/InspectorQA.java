package com.exporsan.exportrace.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inspector_qa")
public class InspectorQA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String codigoLicencia;

    public InspectorQA() {}

    public InspectorQA(Long id, String nombre, String codigoLicencia) {
        this.id = id;
        this.nombre = nombre;
        this.codigoLicencia = codigoLicencia;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCodigoLicencia() { return codigoLicencia; }
    public void setCodigoLicencia(String codigoLicencia) { this.codigoLicencia = codigoLicencia; }
}
