package com.exporsan.lotes.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DecolectaRucResponse {

    @JsonProperty("razon_social")
    private String razonSocial;

    @JsonProperty("numero_documento")
    private String numeroDocumento;

    @JsonProperty("estado")
    private String estado;

    @JsonProperty("condicion")
    private String condicion;

    @JsonProperty("direccion")
    private String direccion;

    @JsonProperty("ubigeo")
    private String ubigeo;

    @JsonProperty("distrito")
    private String distrito;

    @JsonProperty("provincia")
    private String provincia;

    @JsonProperty("departamento")
    private String departamento;

    @JsonProperty("tipo")
    private String tipo;

    @JsonProperty("actividad_economica")
    private String actividadEconomica;

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getCondicion() { return condicion; }
    public void setCondicion(String condicion) { this.condicion = condicion; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getUbigeo() { return ubigeo; }
    public void setUbigeo(String ubigeo) { this.ubigeo = ubigeo; }
    public String getDistrito() { return distrito; }
    public void setDistrito(String distrito) { this.distrito = distrito; }
    public String getProvincia() { return provincia; }
    public void setProvincia(String provincia) { this.provincia = provincia; }
    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getActividadEconomica() { return actividadEconomica; }
    public void setActividadEconomica(String actividadEconomica) { this.actividadEconomica = actividadEconomica; }
}
