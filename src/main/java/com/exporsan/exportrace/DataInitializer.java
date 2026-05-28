package com.exporsan.exportrace;

import com.exporsan.exportrace.model.*;
import com.exporsan.exportrace.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EspecieRepository especieRepository;
    private final LotePescaRepository lotePescaRepository;
    private final AuditoriaCalidadRepository auditoriaCalidadRepository;
    private final TramiteSanipesRepository tramiteSanipesRepository;

    public DataInitializer(EspecieRepository especieRepository, 
                           LotePescaRepository lotePescaRepository,
                           AuditoriaCalidadRepository auditoriaCalidadRepository,
                           TramiteSanipesRepository tramiteSanipesRepository) {
        this.especieRepository = especieRepository;
        this.lotePescaRepository = lotePescaRepository;
        this.auditoriaCalidadRepository = auditoriaCalidadRepository;
        this.tramiteSanipesRepository = tramiteSanipesRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Especies (8 especies)
        if (especieRepository.count() == 0) {
            especieRepository.save(new Especie(null, "Pota", "Dosidicus gigas", "ESP-001", false, -18.0, -15.0));
            especieRepository.save(new Especie(null, "Perico", "Coryphaena hippurus", "ESP-002", false, -18.0, -14.0));
            especieRepository.save(new Especie(null, "Anchoveta", "Engraulis ringens", "ESP-003", true, -20.0, -16.0));
            especieRepository.save(new Especie(null, "Jurel", "Trachurus murphyi", "ESP-004", false, -18.0, -15.0));
            especieRepository.save(new Especie(null, "Caballa", "Scomber japonicus", "ESP-005", false, -19.0, -15.0));
            especieRepository.save(new Especie(null, "Merluza", "Merluccius gayi", "ESP-006", false, -18.0, -14.0));
            especieRepository.save(new Especie(null, "Atun", "Thunnus albacares", "ESP-007", false, -20.0, -16.0));
            especieRepository.save(new Especie(null, "Calamar gigante", "Dosidicus gigas pelagicus", "ESP-008", true, -18.0, -15.0));
        }

        List<Especie> especies = especieRepository.findAll();
        Especie pota = especies.stream().filter(e -> "ESP-001".equals(e.getCodigoSanipes())).findFirst().orElse(null);
        Especie perico = especies.stream().filter(e -> "ESP-002".equals(e.getCodigoSanipes())).findFirst().orElse(null);
        Especie jurel = especies.stream().filter(e -> "ESP-004".equals(e.getCodigoSanipes())).findFirst().orElse(null);
        Especie merluza = especies.stream().filter(e -> "ESP-006".equals(e.getCodigoSanipes())).findFirst().orElse(null);

        // 2. Lotes CHD (15 lotes con distintos estados)
        if (lotePescaRepository.count() == 0) {
            // Lotes 1-5: especie Pota, distintas embarcaciones, peso 1500-8000, APTO, APROBADO, OK, ultimos 30 dias
            lotePescaRepository.save(new LotePesca(null, pota, "San Pedro I", 1500.0, LocalDateTime.now().minusDays(10), "APROBADO", "OK", "APTO"));
            lotePescaRepository.save(new LotePesca(null, pota, "Don Aurelio", 3000.0, LocalDateTime.now().minusDays(15), "APROBADO", "OK", "APTO"));
            lotePescaRepository.save(new LotePesca(null, pota, "Virgen del Carmen", 4500.0, LocalDateTime.now().minusDays(20), "APROBADO", "OK", "APTO"));
            lotePescaRepository.save(new LotePesca(null, pota, "Santa Rosa", 6000.0, LocalDateTime.now().minusDays(25), "APROBADO", "OK", "APTO"));
            lotePescaRepository.save(new LotePesca(null, pota, "El Pacifico", 8000.0, LocalDateTime.now().minusDays(30), "APROBADO", "OK", "APTO"));

            // Lotes 6-9: especie Perico, embarcaciones, peso 800-3000, PENDIENTE, PENDIENTE, OK
            lotePescaRepository.save(new LotePesca(null, perico, "Luz Marina", 800.0, LocalDateTime.now().minusDays(1), "PENDIENTE", "OK", "PENDIENTE"));
            lotePescaRepository.save(new LotePesca(null, perico, "Pescador del Sur", 1200.0, LocalDateTime.now().minusDays(2), "PENDIENTE", "OK", "PENDIENTE"));
            lotePescaRepository.save(new LotePesca(null, perico, "El Vikingo", 2000.0, LocalDateTime.now().minusDays(3), "PENDIENTE", "OK", "PENDIENTE"));
            lotePescaRepository.save(new LotePesca(null, perico, "Mar Abierto", 3000.0, LocalDateTime.now().minusDays(4), "PENDIENTE", "OK", "PENDIENTE"));

            // Lotes 10-12: especie Jurel, RECHAZADO, ALERTA, NO_APTO
            lotePescaRepository.save(new LotePesca(null, jurel, "San Lorenzo", 1500.0, LocalDateTime.now().minusDays(2), "RECHAZADO", "ALERTA", "NO_APTO"));
            lotePescaRepository.save(new LotePesca(null, jurel, "La Chalaca", 2200.0, LocalDateTime.now().minusDays(3), "RECHAZADO", "ALERTA", "NO_APTO"));
            lotePescaRepository.save(new LotePesca(null, jurel, "Nautilus", 1900.0, LocalDateTime.now().minusDays(4), "RECHAZADO", "ALERTA", "NO_APTO"));

            // Lotes 13-15: especie Merluza, PENDIENTE, OK, PENDIENTE, peso 2000-5000
            lotePescaRepository.save(new LotePesca(null, merluza, "Don Bosco", 2500.0, LocalDateTime.now().minusDays(1), "PENDIENTE", "OK", "PENDIENTE"));
            lotePescaRepository.save(new LotePesca(null, merluza, "Nuestra Señora", 3500.0, LocalDateTime.now().minusDays(2), "PENDIENTE", "OK", "PENDIENTE"));
            lotePescaRepository.save(new LotePesca(null, merluza, "Albatros", 4800.0, LocalDateTime.now().minusDays(3), "PENDIENTE", "OK", "PENDIENTE"));
        }

        List<LotePesca> lotes = lotePescaRepository.findAll();

        // 3. Auditorías de calidad (25 registros) para lotes 1 a 10
        if (auditoriaCalidadRepository.count() == 0) {
            String[] inspectores = {"Carlos Quispe", "María Flores", "Juan Huanca"};
            Random rand = new Random();
            int countAudits = 0;

            for (int i = 0; i < 10; i++) {
                if (i >= lotes.size()) break;
                LotePesca lote = lotes.get(i);
                Especie esp = lote.getEspecie();
                boolean esApto = "APTO".equalsIgnoreCase(lote.getEstadoGeneral());

                // Generar entre 2 y 3 auditorías por lote
                int numAudits = (i % 2 == 0) ? 3 : 2;
                for (int a = 0; a < numAudits; a++) {
                    String inspector = inspectores[countAudits % inspectores.length];
                    double temp;
                    boolean dentro;

                    if (esApto) {
                        // Rango de temperatura de la especie
                        double min = (esp != null && esp.getTempMinCritica() != null) ? esp.getTempMinCritica() : -18.0;
                        double max = (esp != null && esp.getTempMaxCritica() != null) ? esp.getTempMaxCritica() : -15.0;
                        temp = min + (max - min) * rand.nextDouble();
                        dentro = true;
                    } else {
                        // Fuera de rango (temperatura más alta)
                        temp = -10.0 + rand.nextDouble() * 5.0; // entre -10 y -5
                        dentro = false;
                    }

                    LocalDateTime timestamp = LocalDateTime.now().minusHours(48 - (a * 12) - (i * 2));

                    auditoriaCalidadRepository.save(new AuditoriaCalidad(
                            null,
                            lote,
                            inspector,
                            timestamp,
                            temp,
                            esApto ? "Temperatura óptima" : "Alerta de temperatura superada",
                            dentro
                    ));
                    countAudits++;
                }
            }
        }

        // 4. Trámites SANIPES (8 registros) para lotes APROBADO o RECHAZADO
        if (tramiteSanipesRepository.count() == 0) {
            int randomNum = 1001;
            for (LotePesca lote : lotes) {
                if ("APROBADO".equalsIgnoreCase(lote.getEstadoSanipes())) {
                    String certCode = "CERT-SANIPES-2024-" + randomNum;
                    tramiteSanipesRepository.save(new TramiteSanipes(
                            null,
                            lote,
                            lote.getFechaRecepcion().plusHours(4),
                            "APROBADO",
                            certCode,
                            "https://sanipes.gob.pe/certificados/" + certCode
                    ));
                    randomNum++;
                } else if ("RECHAZADO".equalsIgnoreCase(lote.getEstadoSanipes())) {
                    tramiteSanipesRepository.save(new TramiteSanipes(
                            null,
                            lote,
                            lote.getFechaRecepcion().plusHours(4),
                            "RECHAZADO",
                            null,
                            null
                    ));
                }
            }
        }
    }
}
