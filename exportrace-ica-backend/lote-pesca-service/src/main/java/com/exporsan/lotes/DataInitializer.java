package com.exporsan.lotes;

import com.exporsan.lotes.model.Embarcacion;
import com.exporsan.lotes.model.Empresa;
import com.exporsan.lotes.model.Especie;
import com.exporsan.lotes.model.LotePesca;
import com.exporsan.lotes.repository.EmbarcacionRepository;
import com.exporsan.lotes.repository.EmpresaRepository;
import com.exporsan.lotes.repository.EspecieRepository;
import com.exporsan.lotes.repository.LotePescaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EspecieRepository especieRepository;
    private final LotePescaRepository lotePescaRepository;
    private final EmbarcacionRepository embarcacionRepository;
    private final EmpresaRepository empresaRepository;

    public DataInitializer(EspecieRepository especieRepository,
                           LotePescaRepository lotePescaRepository,
                           EmbarcacionRepository embarcacionRepository,
                           EmpresaRepository empresaRepository) {
        this.especieRepository = especieRepository;
        this.lotePescaRepository = lotePescaRepository;
        this.embarcacionRepository = embarcacionRepository;
        this.empresaRepository = empresaRepository;
    }

    @Override
    public void run(String... args) {
        if (especieRepository.count() == 0) {
            Especie pota = new Especie();
            pota.setCodigoSanipes("ESP-001");
            pota.setNombreComun("POTA");
            pota.setNombreCientifico("Dosidicus gigas");
            pota.setTempMinCelsius(-18.0);
            pota.setTempMaxCelsius(-15.0);
            pota.setEnVeda(false);
            especieRepository.save(pota);

            Especie perico = new Especie();
            perico.setCodigoSanipes("ESP-002");
            perico.setNombreComun("PERICO");
            perico.setNombreCientifico("Coryphaena hippurus");
            perico.setTempMinCelsius(-18.0);
            perico.setTempMaxCelsius(-14.0);
            perico.setEnVeda(false);
            especieRepository.save(perico);

            Especie caballa = new Especie();
            caballa.setCodigoSanipes("ESP-005");
            caballa.setNombreComun("CABALLA");
            caballa.setNombreCientifico("Scomber japonicus");
            caballa.setTempMinCelsius(-19.0);
            caballa.setTempMaxCelsius(-15.0);
            caballa.setEnVeda(false);
            especieRepository.save(caballa);
        }

        if (empresaRepository.count() == 0) {
            Empresa emp1 = new Empresa();
            emp1.setRazonSocial("Pesquera San Pedro S.A.C.");
            emp1.setRuc("20567891234");
            emp1.setDireccion("Av. Industrial 123, Lima");
            emp1.setTelefono("015551234");
            emp1.setEmail("contacto@sanpedro.com");
            emp1.setEstado("ACTIVA");
            empresaRepository.save(emp1);

            Empresa emp2 = new Empresa();
            emp2.setRazonSocial("Mariscos del Sur S.A.C.");
            emp2.setRuc("20612345678");
            emp2.setDireccion("Jr. Pesquero 456, Ica");
            emp2.setTelefono("015555678");
            emp2.setEmail("info@mariscosdelsur.com");
            emp2.setEstado("ACTIVA");
            empresaRepository.save(emp2);

            Empresa emp3 = new Empresa();
            emp3.setRazonSocial("Productos Hidrobiologicos Ica E.I.R.L.");
            emp3.setRuc("20456789123");
            emp3.setDireccion("Calle del Mar 789, Pisco");
            emp3.setTelefono("015559012");
            emp3.setEmail("ventas@hidrobiologicos.com");
            emp3.setEstado("ACTIVA");
            empresaRepository.save(emp3);

            Empresa emp4 = new Empresa();
            emp4.setRazonSocial("Pesquera El Vikingo S.A.");
            emp4.setRuc("20123456789");
            emp4.setDireccion("Av. del Puerto 321, Callao");
            emp4.setTelefono("015553456");
            emp4.setEmail("operaciones@elvikingo.com");
            emp4.setEstado("ACTIVA");
            empresaRepository.save(emp4);

            Empresa emp5 = new Empresa();
            emp5.setRazonSocial("Pesqueria Santa Rosa del Mar S.A.C.");
            emp5.setRuc("20555111222");
            emp5.setDireccion("Malecon 654, Chimbote");
            emp5.setTelefono("015557890");
            emp5.setEmail("admin@santarosamar.com");
            emp5.setEstado("ACTIVA");
            empresaRepository.save(emp5);
        }

        if (embarcacionRepository.count() == 0) {
            Empresa e1 = empresaRepository.findByRuc("20567891234").orElse(null);
            Empresa e2 = empresaRepository.findByRuc("20612345678").orElse(null);
            Empresa e3 = empresaRepository.findByRuc("20456789123").orElse(null);
            Empresa e4 = empresaRepository.findByRuc("20123456789").orElse(null);
            Empresa e5 = empresaRepository.findByRuc("20555111222").orElse(null);

            Embarcacion emb1 = new Embarcacion();
            emb1.setNombreEmbarcacion("San Pedro I");
            emb1.setMatricula("PSI-0142");
            emb1.setPuertoBase("San Martin, Paracas");
            emb1.setCapacidadToneladas(new BigDecimal("120.5"));
            emb1.setEstado("ACTIVA");
            emb1.setNombreCapitan("Juan Quispe Ramos");
            emb1.setLicenciaCapitan("LIC-2024-001");
            emb1.setEmpresa(e1);
            embarcacionRepository.save(emb1);

            Embarcacion emb2 = new Embarcacion();
            emb2.setNombreEmbarcacion("Don Aurelio");
            emb2.setMatricula("DAU-2201");
            emb2.setPuertoBase("San Martin, Paracas");
            emb2.setCapacidadToneladas(new BigDecimal("200.0"));
            emb2.setEstado("ACTIVA");
            emb2.setNombreCapitan("Carlos Salazar Paredes");
            emb2.setLicenciaCapitan("LIC-2024-002");
            emb2.setEmpresa(e2);
            embarcacionRepository.save(emb2);

            Embarcacion emb3 = new Embarcacion();
            emb3.setNombreEmbarcacion("Luz Marina");
            emb3.setMatricula("LZM-0907");
            emb3.setPuertoBase("San Martin, Paracas");
            emb3.setCapacidadToneladas(new BigDecimal("85.0"));
            emb3.setEstado("ACTIVA");
            emb3.setNombreCapitan("Miguel Torres Luna");
            emb3.setLicenciaCapitan("LIC-2024-003");
            emb3.setEmpresa(e3);
            embarcacionRepository.save(emb3);

            Embarcacion emb4 = new Embarcacion();
            emb4.setNombreEmbarcacion("El Vikingo");
            emb4.setMatricula("EVK-4410");
            emb4.setPuertoBase("San Martin, Paracas");
            emb4.setCapacidadToneladas(new BigDecimal("150.0"));
            emb4.setEstado("ACTIVA");
            emb4.setNombreCapitan("Roberto Pizarro Leon");
            emb4.setLicenciaCapitan("LIC-2024-004");
            emb4.setEmpresa(e4);
            embarcacionRepository.save(emb4);

            Embarcacion emb5 = new Embarcacion();
            emb5.setNombreEmbarcacion("Santa Rosa");
            emb5.setMatricula("SR-1155");
            emb5.setPuertoBase("San Martin, Paracas");
            emb5.setCapacidadToneladas(new BigDecimal("180.0"));
            emb5.setEstado("ACTIVA");
            emb5.setNombreCapitan("Alfredo Cardenas Ruiz");
            emb5.setLicenciaCapitan("LIC-2024-005");
            emb5.setEmpresa(e5);
            embarcacionRepository.save(emb5);
        }

        if (lotePescaRepository.count() == 0) {
            Embarcacion eb1 = embarcacionRepository.findByMatricula("PSI-0142").orElse(null);
            Embarcacion eb2 = embarcacionRepository.findByMatricula("DAU-2201").orElse(null);
            Embarcacion eb3 = embarcacionRepository.findByMatricula("LZM-0907").orElse(null);
            Embarcacion eb4 = embarcacionRepository.findByMatricula("EVK-4410").orElse(null);
            Embarcacion eb5 = embarcacionRepository.findByMatricula("SR-1155").orElse(null);

            Empresa emp1 = empresaRepository.findByRuc("20567891234").orElse(null);
            Empresa emp2 = empresaRepository.findByRuc("20612345678").orElse(null);
            Empresa emp3 = empresaRepository.findByRuc("20456789123").orElse(null);
            Empresa emp4 = empresaRepository.findByRuc("20123456789").orElse(null);
            Empresa emp5 = empresaRepository.findByRuc("20555111222").orElse(null);

            // Lote 1: POTA de San Pedro I — lote pequeno recepcionado y aprobado el mismo dia
            LotePesca lote1 = new LotePesca();
            lote1.setCodigoLote("LOT-2026-001");
            lote1.setEspecie("POTA");
            lote1.setEmbarcacion(eb1);
            lote1.setEmpresa(emp1);
            lote1.setPesoKg(1500.0);
            lote1.setFechaRecepcion(LocalDateTime.of(2026, 6, 15, 10, 30));
            lote1.setEstadoSanipes("APROBADO");
            lote1.setEstadoCadenaFrio("OK");
            lote1.setFechaSalidaLote(LocalDateTime.of(2026, 6, 15, 14, 30));
            lotePescaRepository.save(lote1);

            // Lote 2: POTA de Don Aurelio — lote grande aprobado tras 2 dias de inspeccion
            LotePesca lote2 = new LotePesca();
            lote2.setCodigoLote("LOT-2026-002");
            lote2.setEspecie("POTA");
            lote2.setEmbarcacion(eb2);
            lote2.setEmpresa(emp2);
            lote2.setPesoKg(3000.0);
            lote2.setFechaRecepcion(LocalDateTime.of(2026, 6, 20, 8, 15));
            lote2.setEstadoSanipes("APROBADO");
            lote2.setEstadoCadenaFrio("OK");
            lote2.setFechaSalidaLote(LocalDateTime.of(2026, 6, 22, 10, 0));
            lotePescaRepository.save(lote2);

            // Lote 3: PERICO de Luz Marina — cadena de frio ROTA, RECHAZADO por SANIPES
            LotePesca lote3 = new LotePesca();
            lote3.setCodigoLote("LOT-2026-003");
            lote3.setEspecie("PERICO");
            lote3.setEmbarcacion(eb3);
            lote3.setEmpresa(emp3);
            lote3.setPesoKg(800.0);
            lote3.setFechaRecepcion(LocalDateTime.of(2026, 6, 22, 14, 0));
            lote3.setEstadoSanipes("RECHAZADO");
            lote3.setEstadoCadenaFrio("ALERTA");
            lotePescaRepository.save(lote3);

            // Lote 4: PERICO de El Vikingo — aprobado y despachado al dia siguiente
            LotePesca lote4 = new LotePesca();
            lote4.setCodigoLote("LOT-2026-004");
            lote4.setEspecie("PERICO");
            lote4.setEmbarcacion(eb4);
            lote4.setEmpresa(emp4);
            lote4.setPesoKg(2000.0);
            lote4.setFechaRecepcion(LocalDateTime.of(2026, 6, 25, 9, 45));
            lote4.setEstadoSanipes("APROBADO");
            lote4.setEstadoCadenaFrio("OK");
            lote4.setFechaSalidaLote(LocalDateTime.of(2026, 6, 26, 6, 0));
            lotePescaRepository.save(lote4);

            // Lote 5: CABALLA de Santa Rosa — recepcionado recientemente, pendiente de inspeccion
            LotePesca lote5 = new LotePesca();
            lote5.setCodigoLote("LOT-2026-005");
            lote5.setEspecie("CABALLA");
            lote5.setEmbarcacion(eb5);
            lote5.setEmpresa(emp5);
            lote5.setPesoKg(4500.0);
            lote5.setFechaRecepcion(LocalDateTime.of(2026, 6, 28, 7, 0));
            lote5.setEstadoSanipes("PENDIENTE");
            lote5.setEstadoCadenaFrio("OK");
            lotePescaRepository.save(lote5);
        }
    }
}
