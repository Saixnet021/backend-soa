package com.exporsan.certificacion.dto;

public class ExpedienteDTO {

    private LoteDTO lote;
    private ResumenFrioDTO resumenFrio;
    private TramiteSanipesDTO tramite;
    private String qrData;
    private boolean aptoParaExportacion;
    private String fechaSalidaLote;
    private Long tiempoEnPlantaHoras;

    public ExpedienteDTO() {
    }

    public LoteDTO getLote() { return lote; }
    public void setLote(LoteDTO lote) { this.lote = lote; }

    public ResumenFrioDTO getResumenFrio() { return resumenFrio; }
    public void setResumenFrio(ResumenFrioDTO resumenFrio) { this.resumenFrio = resumenFrio; }

    public TramiteSanipesDTO getTramite() { return tramite; }
    public void setTramite(TramiteSanipesDTO tramite) { this.tramite = tramite; }

    public String getQrData() { return qrData; }
    public void setQrData(String qrData) { this.qrData = qrData; }

    public boolean isAptoParaExportacion() { return aptoParaExportacion; }
    public void setAptoParaExportacion(boolean aptoParaExportacion) { this.aptoParaExportacion = aptoParaExportacion; }

    public String getFechaSalidaLote() { return fechaSalidaLote; }
    public void setFechaSalidaLote(String fechaSalidaLote) { this.fechaSalidaLote = fechaSalidaLote; }

    public Long getTiempoEnPlantaHoras() { return tiempoEnPlantaHoras; }
    public void setTiempoEnPlantaHoras(Long tiempoEnPlantaHoras) { this.tiempoEnPlantaHoras = tiempoEnPlantaHoras; }
}
