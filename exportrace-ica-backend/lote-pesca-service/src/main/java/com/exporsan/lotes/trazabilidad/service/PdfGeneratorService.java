package com.exporsan.lotes.trazabilidad.service;

import com.exporsan.lotes.trazabilidad.dto.DespachoResponseDTO;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;

@Service
public class PdfGeneratorService {

    public byte[] generatePackingList(DespachoResponseDTO despacho) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font definitions
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("PACKING LIST COMERCIAL", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("\n"));

            // Table of general details
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            addCell(table, "Lote Producción ID:", boldFont);
            addCell(table, despacho.getLote().getLoteOrigen().getIdLoteProduccion(), normalFont);

            addCell(table, "Especie:", boldFont);
            addCell(table, despacho.getLote().getLoteOrigen().getLoteOrigen().getLoteOrigen().getEspecie().name(), normalFont);

            addCell(table, "Talla / Calibre:", boldFont);
            addCell(table, despacho.getLote().getLoteOrigen().getLoteOrigen().getCalibreTalla().name(), normalFont);

            addCell(table, "Cantidad de Bultos/Cajas:", boldFont);
            addCell(table, String.valueOf(despacho.getLote().getLoteOrigen().getCantidadBultosCajas()), normalFont);

            addCell(table, "Tipo de Empaque:", boldFont);
            addCell(table, despacho.getLote().getLoteOrigen().getTipoEmpaque().name(), normalFont);

            addCell(table, "Peso Neto Final:", boldFont);
            addCell(table, despacho.getLote().getLoteOrigen().getPesoNetoFinal().toString() + " Kg", normalFont);

            addCell(table, "Cliente RUC:", boldFont);
            addCell(table, despacho.getRucCliente(), normalFont);

            addCell(table, "Cliente Razón Social:", boldFont);
            addCell(table, despacho.getRazonSocialCliente(), normalFont);

            addCell(table, "Puerto de Destino:", boldFont);
            addCell(table, despacho.getPuertoDestino(), normalFont);

            addCell(table, "Reserva Naviera (Booking):", boldFont);
            addCell(table, despacho.getReservaNaviera(), normalFont);

            addCell(table, "Contenedor Frigorífico:", boldFont);
            addCell(table, despacho.getNumeroContenedorFrigorifico(), normalFont);

            addCell(table, "Precintos Aduaneros/Navieros:", boldFont);
            addCell(table, despacho.getPrecintosAduanerosNavieros(), normalFont);

            addCell(table, "Temperatura de Seteo:", boldFont);
            addCell(table, despacho.getTemperaturaSeteoContenedor().toString() + " °C", normalFont);

            addCell(table, "Número DUS:", boldFont);
            addCell(table, despacho.getNumeroDUS(), normalFont);

            addCell(table, "Certificado Sanitario:", boldFont);
            addCell(table, despacho.getCodigoCertificadoSanitario(), normalFont);

            addCell(table, "Despachador Responsable:", boldFont);
            addCell(table, despacho.getNombreDespachador(), normalFont);

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF: " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    public byte[] generateGuiaRemision(DespachoResponseDTO despacho) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("GUIA DE REMISION REMITENTE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("\n"));

            // Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            addCell(table, "Código Guía:", boldFont);
            addCell(table, "GR-" + despacho.getLote().getLoteOrigen().getIdLoteProduccion(), normalFont);

            addCell(table, "Destinatario:", boldFont);
            addCell(table, despacho.getRazonSocialCliente() + " (RUC: " + despacho.getRucCliente() + ")", normalFont);

            addCell(table, "Punto de Partida:", boldFont);
            addCell(table, "Planta de Procesamiento ExporTrace - Ica", normalFont);

            addCell(table, "Punto de Llegada (Puerto):", boldFont);
            addCell(table, despacho.getPuertoDestino(), normalFont);

            addCell(table, "Especie Transportada:", boldFont);
            addCell(table, despacho.getLote().getLoteOrigen().getLoteOrigen().getLoteOrigen().getEspecie().name(), normalFont);

            addCell(table, "Cantidad de Cajas:", boldFont);
            addCell(table, String.valueOf(despacho.getLote().getLoteOrigen().getCantidadBultosCajas()), normalFont);

            addCell(table, "Peso Bruto Total (Kg):", boldFont);
            addCell(table, despacho.getLote().getLoteOrigen().getPesoNetoFinal().toString() + " Kg", normalFont);

            addCell(table, "Contenedor Frigorífico:", boldFont);
            addCell(table, despacho.getNumeroContenedorFrigorifico(), normalFont);

            addCell(table, "Precintos de Seguridad:", boldFont);
            addCell(table, despacho.getPrecintosAduanerosNavieros(), normalFont);

            addCell(table, "Temperatura de Seteo:", boldFont);
            addCell(table, despacho.getTemperaturaSeteoContenedor().toString() + " °C", normalFont);

            addCell(table, "Fecha de Emisión:", boldFont);
            addCell(table, LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), normalFont);

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar Guía de Remisión PDF: " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        table.addCell(cell);
    }
}
