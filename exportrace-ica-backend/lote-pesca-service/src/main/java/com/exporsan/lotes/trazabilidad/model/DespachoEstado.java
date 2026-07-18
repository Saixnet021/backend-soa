package com.exporsan.lotes.trazabilidad.model;

public enum DespachoEstado {
    STOCK_DISPONIBLE("#2E7D32", "🟢"),
    DESPACHADO_EN_TRANSITO("#424242", "✈️");

    private final String colorHex;
    private final String emoji;

    DespachoEstado(String colorHex, String emoji) {
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
