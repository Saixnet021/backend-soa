package com.exporsan.lotes.trazabilidad.model;

public enum ClasificacionEstado {
    APROBADO_CORTE("#2E7D32", "🟢"),
    RECHAZADO_TOTAL("#C62828", "🔴"),
    OBSERVADO("#EF6C00", "🟠");

    private final String colorHex;
    private final String emoji;

    ClasificacionEstado(String colorHex, String emoji) {
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
