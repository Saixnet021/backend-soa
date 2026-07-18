package com.exporsan.lotes.trazabilidad.model;

public enum RecepcionEstado {
    PENDIENTE_QA("#F5C518", "🟡"),
    CLASIFICADA("#2E7D32", "🟢");

    private final String colorHex;
    private final String emoji;

    RecepcionEstado(String colorHex, String emoji) {
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
