package com.exporsan.lotes;

import com.exporsan.lotes.model.Especie;
import com.exporsan.lotes.model.LotePesca;
import com.exporsan.lotes.repository.EspecieRepository;
import com.exporsan.lotes.repository.LotePescaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EspecieRepository especieRepository;
    private final LotePescaRepository lotePescaRepository;

    public DataInitializer(EspecieRepository especieRepository, LotePescaRepository lotePescaRepository) {
        this.especieRepository = especieRepository;
        this.lotePescaRepository = lotePescaRepository;
    }

    @Override
    public void run(String... args) {
        if (especieRepository.count() == 0) {
            Especie pota = new Especie();
            pota.setCodigoSanipes("ESP-001");
            pota.setNombreComun("Pota gigante");
            pota.setNombreCientifico("Dosidicus gigas");
            pota.setTempMinCelsius(-18.0);
            pota.setTempMaxCelsius(-15.0);
            pota.setEnVeda(false);
            especieRepository.save(pota);

            Especie perico = new Especie();
            perico.setCodigoSanipes("ESP-002");
            perico.setNombreComun("Perico");
            perico.setNombreCientifico("Coryphaena hippurus");
            perico.setTempMinCelsius(-18.0);
            perico.setTempMaxCelsius(-14.0);
            perico.setEnVeda(false);
            especieRepository.save(perico);

            Especie caballa = new Especie();
            caballa.setCodigoSanipes("ESP-005");
            caballa.setNombreComun("Caballa");
            caballa.setNombreCientifico("Scomber japonicus");
            caballa.setTempMinCelsius(-19.0);
            caballa.setTempMaxCelsius(-15.0);
            caballa.setEnVeda(false);
            especieRepository.save(caballa);
        }

        if (lotePescaRepository.count() == 0) {
            LotePesca lote1 = new LotePesca();
            lote1.setCodigoLote("LOT-2026-001");
            lote1.setEspecie("POTA");
            lote1.setNombreEmbarcacion("San Pedro I");
            lote1.setPesoKg(1500.0);
            lote1.setFechaRecepcion(LocalDateTime.of(2026, 6, 15, 10, 30));
            lote1.setEstadoSanipes("APROBADO");
            lote1.setEstadoCadenaFrio("OK");
            lotePescaRepository.save(lote1);

            LotePesca lote2 = new LotePesca();
            lote2.setCodigoLote("LOT-2026-002");
            lote2.setEspecie("POTA");
            lote2.setNombreEmbarcacion("Don Aurelio");
            lote2.setPesoKg(3000.0);
            lote2.setFechaRecepcion(LocalDateTime.of(2026, 6, 20, 8, 15));
            lote2.setEstadoSanipes("PENDIENTE");
            lote2.setEstadoCadenaFrio("OK");
            lotePescaRepository.save(lote2);

            LotePesca lote3 = new LotePesca();
            lote3.setCodigoLote("LOT-2026-003");
            lote3.setEspecie("PERICO");
            lote3.setNombreEmbarcacion("Luz Marina");
            lote3.setPesoKg(800.0);
            lote3.setFechaRecepcion(LocalDateTime.of(2026, 6, 22, 14, 0));
            lote3.setEstadoSanipes("PENDIENTE");
            lote3.setEstadoCadenaFrio("OK");
            lotePescaRepository.save(lote3);

            LotePesca lote4 = new LotePesca();
            lote4.setCodigoLote("LOT-2026-004");
            lote4.setEspecie("PERICO");
            lote4.setNombreEmbarcacion("El Vikingo");
            lote4.setPesoKg(2000.0);
            lote4.setFechaRecepcion(LocalDateTime.of(2026, 6, 25, 9, 45));
            lote4.setEstadoSanipes("APTO_EXPORTACION");
            lote4.setEstadoCadenaFrio("OK");
            lotePescaRepository.save(lote4);

            LotePesca lote5 = new LotePesca();
            lote5.setCodigoLote("LOT-2026-005");
            lote5.setEspecie("CABALLA");
            lote5.setNombreEmbarcacion("Santa Rosa");
            lote5.setPesoKg(4500.0);
            lote5.setFechaRecepcion(LocalDateTime.of(2026, 6, 28, 7, 0));
            lote5.setEstadoSanipes("PENDIENTE");
            lote5.setEstadoCadenaFrio("ALERTA");
            lotePescaRepository.save(lote5);
        }
    }
}
