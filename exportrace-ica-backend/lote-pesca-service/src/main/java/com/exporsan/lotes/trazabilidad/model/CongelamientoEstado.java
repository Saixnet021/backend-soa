package com.exporsan.lotes.trazabilidad.model;

public enum CongelamientoEstado {
    EN_TUNEL("#4FC3F7", "🧊"),
    APTO_PARA_EXPORTACION("#1B5E20", "🟢"),
    NO_APTO_RETENIDO("#B71C1C", "🔴"),
    CUARENTENA("#F9A825", "🟡");

    private final String colorHex;
    private final String emoji;

    CongelamientoEstado(String colorHex, String emoji) {
        this.colorHex = colorHex;
        this.emoji = emoji;
    }

    public String getColorHex() {
        return colorHex;
    }

    public String getEmoji() {
        return emoji;
    }
}
