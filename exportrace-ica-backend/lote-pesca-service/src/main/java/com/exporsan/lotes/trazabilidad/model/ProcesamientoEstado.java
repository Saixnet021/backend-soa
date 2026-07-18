package com.exporsan.lotes.trazabilidad.model;

public enum ProcesamientoEstado {
    LISTO_PARA_ENFRIAR("#1565C0", "🔵");

    private final String colorHex;
    private final String emoji;

    ProcesamientoEstado(String colorHex, String emoji) {
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
