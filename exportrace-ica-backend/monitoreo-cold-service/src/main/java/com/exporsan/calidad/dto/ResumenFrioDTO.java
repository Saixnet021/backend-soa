package com.exporsan.calidad.dto;

public class ResumenFrioDTO {

    private Double tempMin;
    private Double tempMax;
    private Double tempPromedio;
    private boolean hayAlerta;
    private String estadoCadenaFrio;

    public ResumenFrioDTO() {
    }

    public ResumenFrioDTO(Double tempMin, Double tempMax, Double tempPromedio, boolean hayAlerta, String estadoCadenaFrio) {
        this.tempMin = tempMin;
        this.tempMax = tempMax;
        this.tempPromedio = tempPromedio;
        this.hayAlerta = hayAlerta;
        this.estadoCadenaFrio = estadoCadenaFrio;
    }

    public Double getTempMin() { return tempMin; }
    public void setTempMin(Double tempMin) { this.tempMin = tempMin; }

    public Double getTempMax() { return tempMax; }
    public void setTempMax(Double tempMax) { this.tempMax = tempMax; }

    public Double getTempPromedio() { return tempPromedio; }
    public void setTempPromedio(Double tempPromedio) { this.tempPromedio = tempPromedio; }

    public boolean isHayAlerta() { return hayAlerta; }
    public void setHayAlerta(boolean hayAlerta) { this.hayAlerta = hayAlerta; }

    public String getEstadoCadenaFrio() { return estadoCadenaFrio; }
    public void setEstadoCadenaFrio(String estadoCadenaFrio) { this.estadoCadenaFrio = estadoCadenaFrio; }
}
