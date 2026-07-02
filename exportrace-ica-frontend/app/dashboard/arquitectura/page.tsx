'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Server, Database, Shield, Truck, Thermometer, FileCheck,
  RefreshCw, Play, Send, Activity, Layers, GitBranch, Zap,
  Globe, Code, ArrowRight, CheckCircle, AlertCircle, Clock,
  Monitor, Shuffle
} from 'lucide-react';
import api from '@/lib/api';

interface ServiceInfo {
  nombre: string;
  url: string;
  puerto: number;
  estado: string;
  tipo: string;
  icono: string;
  color: string;
  endpoints: string[];
}

interface AuditLog {
  id: number;
  timestamp: string;
  usuarioUsername: string;
  accion: string;
  entidad: string;
  entidadId: string;
  resultado: string;
  servicio: string;
  mensajeError: string;
}

interface RegistryEntry {
  id: number;
  serviceName: string;
  serviceUrl: string;
  description: string;
  category: string;
  version: string;
  status: string;
  lastHeartbeat: string;
}

interface BpmProcess {
  id: number;
  tipoProceso: string;
  loteId: number;
  estado: string;
  subEstado: string;
  fechaInicio: string;
  fechaFin: string;
}

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8090';
const LOTE_URL = process.env.NEXT_PUBLIC_LOTE_URL || 'http://localhost:8081';
const MONITOREO_URL = process.env.NEXT_PUBLIC_MONITOREO_URL || 'http://localhost:8082';
const CERTIFICACION_URL = process.env.NEXT_PUBLIC_CERTIFICACION_URL || 'http://localhost:8083';
const REGISTRY_URL = process.env.NEXT_PUBLIC_REGISTRY_URL || 'http://localhost:8084';

const SERVICIOS: ServiceInfo[] = [
  {
    nombre: 'API Gateway',
    url: GATEWAY_URL,
    puerto: 8080,
    estado: 'ACTIVO',
    tipo: 'Gateway',
    icono: 'globe',
    color: 'bg-purple-500',
    endpoints: ['/api/v1/**', '/gateway/status', '/ws/**']
  },
  {
    nombre: 'Auth Service',
    url: AUTH_URL,
    puerto: 8090,
    estado: 'ACTIVO',
    tipo: 'Seguridad',
    icono: 'shield',
    color: 'bg-red-500',
    endpoints: ['/api/v1/auth/login', '/api/v1/auth/validate', '/api/v1/usuarios']
  },
  {
    nombre: 'Lote Pesca Service',
    url: LOTE_URL,
    puerto: 8081,
    estado: 'ACTIVO',
    tipo: 'Dominio',
    icono: 'truck',
    color: 'bg-blue-500',
    endpoints: ['/api/v1/maestros/lotes', '/api/v1/maestros/especies', '/ws/*']
  },
  {
    nombre: 'Monitoreo Cold Service',
    url: MONITOREO_URL,
    puerto: 8082,
    estado: 'ACTIVO',
    tipo: 'Monitoreo',
    icono: 'thermometer',
    color: 'bg-cyan-500',
    endpoints: ['/api/v1/calidad/temperaturas', '/api/v1/calidad/reglas']
  },
  {
    nombre: 'Certificación Service',
    url: CERTIFICACION_URL,
    puerto: 8083,
    estado: 'ACTIVO',
    tipo: 'Orquestación',
    icono: 'filecheck',
    color: 'bg-green-500',
    endpoints: ['/api/v1/orch/**', '/api/v1/tramites/**', '/api/v1/bpm/**']
  },
  {
    nombre: 'Service Registry',
    url: REGISTRY_URL,
    puerto: 8084,
    estado: 'ACTIVO',
    tipo: 'UDDI',
    icono: 'database',
    color: 'bg-amber-500',
    endpoints: ['/api/v1/registry/**']
  }
];

const BPM_STATES = [
  { id: 'INICIADO', label: 'Iniciado', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'ESPERANDO_DOCUMENTACION', label: 'Esperando Documentación', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { id: 'ENVIADO_SANIPES', label: 'Enviado SANIPES', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { id: 'EN_REVISION', label: 'En Revisión', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { id: 'OBSERVADO', label: 'Observado', color: 'bg-red-100 border-red-300 text-red-800' },
  { id: 'CERTIFICADO', label: 'Certificado', color: 'bg-green-100 border-green-300 text-green-800' },
  { id: 'RECHAZADO', label: 'Rechazado', color: 'bg-red-100 border-red-300 text-red-800' },
  { id: 'LISTO_PARA_DESPACHO', label: 'Listo para Despacho', color: 'bg-teal-100 border-teal-300 text-teal-800' }
];

const SOAP_REQUEST = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:emb="http://exporsan.com/embarcaciones">
  <soap:Body>
    <emb:ObtenerEmbarcacionesRequest>
    </emb:ObtenerEmbarcacionesRequest>
  </soap:Body>
</soap:Envelope>`;

export default function ArquitecturaSOAPage() {
  const [activeTab, setActiveTab] = useState<'mapa' | 'bpm' | 'soap' | 'auditoria' | 'registry' | 'metricas'>('mapa');
  const [gatewayStatus, setGatewayStatus] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [registryEntries, setRegistryEntries] = useState<RegistryEntry[]>([]);
  const [bpmProcesses, setBpmProcesses] = useState<BpmProcess[]>([]);
  const [soapRequest, setSoapRequest] = useState(SOAP_REQUEST);
  const [soapResponse, setSoapResponse] = useState('');
  const [soapLoading, setSoapLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const soapPreRef = useRef<HTMLPreElement>(null);

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (soapPreRef.current) {
      soapPreRef.current.scrollTop = e.currentTarget.scrollTop;
      soapPreRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statusRes, auditRes, registryRes, bpmRes] = await Promise.allSettled([
        api.get('/gateway/status'),
        api.get('/api/v1/auditoria').catch(() => ({ data: [] })),
        api.get('/api/v1/registry').catch(() => ({ data: [] })),
        api.get('/api/v1/bpm/procesos').catch(() => ({ data: [] }))
      ]);

      if (statusRes.status === 'fulfilled') setGatewayStatus(statusRes.value.data);
      if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value.data);
      if (registryRes.status === 'fulfilled') setRegistryEntries(registryRes.value.data);
      if (bpmRes.status === 'fulfilled') setBpmProcesses(bpmRes.value.data);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  const highlightXml = (xml: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = xml;
    let key = 0;

    const regex = /(<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<\/?[\w:-]+(?:\s+[\w:-]+(?:=(?:"[^"]*"|'[^\']*'|[^\s>]*))?)*\s*\/?>|&[a-z]+;|&#[0-9]+;|&#x[0-9a-fA-F]+;|[^<&]+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(remaining)) !== null) {
      const token = match[0];
      if (token.startsWith('<?')) {
        parts.push(<span key={key++} className="text-gray-400">{token}</span>);
      } else if (token.startsWith('<!--')) {
        parts.push(<span key={key++} className="text-gray-400 italic">{token}</span>);
      } else if (token.startsWith('</')) {
        parts.push(<span key={key++} className="text-rose-400">{token}</span>);
      } else if (token.startsWith('<')) {
        parts.push(<span key={key++} className="text-rose-400">{token}</span>);
      } else if (token.startsWith('&')) {
        parts.push(<span key={key++} className="text-amber-400">{token}</span>);
      } else {
        parts.push(<span key={key++} className="text-emerald-400">{token}</span>);
      }
    }
    return parts.length > 0 ? parts : xml;
  };

  const highlightSoapRequest = (xml: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let key = 0;
    const regex = /(<\?[\s\S]*?\?>|<\/?[\w:-]+(?:\s+[\w:-]+=(?:"[^"]*"|'[^\']*'))?\s*\/?>|&[a-z]+;|[^<&]+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(xml)) !== null) {
      const token = match[0];
      if (token.startsWith('<?')) {
        parts.push(<span key={key++} className="text-gray-400">{token}</span>);
      } else if (token.startsWith('</')) {
        parts.push(<span key={key++} className="text-blue-400">{token}</span>);
      } else if (token.startsWith('<')) {
        parts.push(<span key={key++} className="text-blue-400">{token}</span>);
      } else if (token.startsWith('&')) {
        parts.push(<span key={key++} className="text-amber-400">{token}</span>);
      } else {
        parts.push(<span key={key++} className="text-gray-200">{token}</span>);
      }
    }
    return parts.length > 0 ? parts : xml;
  };

  const formatXml = (xml: string): string => {
    try {
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) return xml;
      const serializer = new XMLSerializer();
      let formatted = serializer.serializeToString(doc);
      let indent = 0;
      const lines = formatted
        .replace(/>\s*</g, '>\n<')
        .split('\n');
      const result = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('</')) indent = Math.max(0, indent - 1);
        const pad = '  '.repeat(indent);
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.startsWith('<?') && !trimmed.endsWith('/>') && !trimmed.includes('xmlns:')) indent++;
        return pad + trimmed;
      }).filter(l => l.trim()).join('\n');
      return result;
    } catch {
      return xml;
    }
  };

  const sendSoapRequest = async () => {
    setSoapLoading(true);
    setSoapResponse('');
    try {
      const response = await fetch('/api/soap-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'ObtenerEmbarcaciones'
        },
        body: soapRequest
      });
      const text = await response.text();
      setSoapResponse(formatXml(text));
    } catch (error) {
      setSoapResponse('Error de conexion. Verifique que el servicio SOAP este activo.');
    } finally {
      setSoapLoading(false);
    }
  };

  const tabs = [
    { id: 'mapa' as const, label: 'Mapa de Servicios', icon: Server },
    { id: 'bpm' as const, label: 'Flujo BPM', icon: GitBranch },
    { id: 'soap' as const, label: 'Cliente SOAP', icon: Code },
    { id: 'auditoria' as const, label: 'Auditoría', icon: Shield },
    { id: 'registry' as const, label: 'Registro UDDI', icon: Database },
    { id: 'metricas' as const, label: 'Métricas', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arquitectura SOA</h1>
          <p className="text-muted-foreground">
            Panel de control de la arquitectura orientada a servicios - Exportadora San Andrés
          </p>
        </div>
        <Button onClick={loadAllData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* MAPA DE SERVICIOS */}
      {activeTab === 'mapa' && (
        <div className="space-y-6">
          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICIOS.map((svc) => (
              <Card key={svc.nombre} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${svc.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{svc.nombre}</CardTitle>
                    <Badge variant={svc.estado === 'ACTIVO' ? 'success' : 'danger'}>
                      {svc.estado}
                    </Badge>
                  </div>
                  <CardDescription>{svc.tipo} - Puerto {svc.puerto}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">{svc.url}</p>
                  <div className="flex flex-wrap gap-1">
                    {svc.endpoints.map((ep, i) => (
                      <Badge key={i} variant="gray" className="text-xs">
                        {ep}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Architecture Diagram */}
          <Card>
            <CardHeader>
              <CardTitle>Diagrama de Comunicación SOA</CardTitle>
              <CardDescription>Flujo de requests a través del ESB (API Gateway)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm font-medium">Cliente (PWA)</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <div className="bg-purple-100 px-6 py-3 rounded-lg border-2 border-purple-300">
                  <div className="flex items-center space-x-2">
                    <Shuffle className="h-4 w-4" />
                    <span className="text-sm font-bold">API Gateway (ESB) - Puerto 8080</span>
                  </div>
                  <p className="text-xs text-center mt-1">JWT Auth - Rate Limiting - Circuit Breaker - Transform</p>
                </div>
                <div className="flex space-x-4 mt-2">
                  <ArrowRight className="h-6 w-6 text-gray-400 rotate-90" />
                </div>
                <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                  {SERVICIOS.filter(s => s.puerto !== 8080).map(svc => (
                    <div key={svc.puerto} className={`${svc.color.replace('bg-', 'bg-')} bg-opacity-10 p-3 rounded-lg border text-center`}>
                      <p className="text-xs font-bold">{svc.nombre}</p>
                      <p className="text-xs text-muted-foreground">:{svc.puerto}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SOAP Endpoint */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoint SOAP/WSDL</CardTitle>
              <CardDescription>WSDL Disponible en: {LOTE_URL}/ws/EmbarcacionesPort.wsdl</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border">
                  <p className="text-xs font-bold">ObtenerEmbarcaciones</p>
                  <p className="text-xs text-muted-foreground">Consulta embarcaciones por ID lote o nombre</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border">
                  <p className="text-xs font-bold">RegistrarEmbarcacion</p>
                  <p className="text-xs text-muted-foreground">Registra nueva embarcación</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border">
                  <p className="text-xs font-bold">ValidarEstadoEmbarcacion</p>
                  <p className="text-xs text-muted-foreground">Valida estado por matrícula</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FLUJO BPM */}
      {activeTab === 'bpm' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Procesos de Negocio (BPM)</CardTitle>
              <CardDescription>Máquina de estados para certificaciones SANIPES</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-3 py-6">
                {BPM_STATES.map((state, i) => (
                  <div key={state.id} className="flex items-center">
                    <div className={`px-4 py-2 rounded-lg border-2 ${state.color} text-center min-w-[140px]`}>
                      <p className="text-xs font-bold">{state.label}</p>
                      <p className="text-xs opacity-60">{state.id}</p>
                    </div>
                    {i < BPM_STATES.length - 1 && (
                      <ArrowRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Procesos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              {bpmProcesses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay procesos BPM registrados</p>
              ) : (
                <div className="space-y-2">
                  {bpmProcesses.map(proc => (
                    <div key={proc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Proceso #{proc.id} - {proc.tipoProceso}</p>
                        <p className="text-xs text-muted-foreground">Lote #{proc.loteId}</p>
                      </div>
                      <Badge variant={proc.estado === 'CERTIFICADO' || proc.estado === 'LISTO_PARA_DESPACHO' ? 'success' : 'warning'}>
                        {proc.estado === 'LISTO_PARA_DESPACHO' ? 'LISTO PARA DESPACHO' : proc.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>APIs BPM Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { method: 'POST', path: '/api/v1/bpm/iniciar', desc: 'Iniciar nuevo proceso' },
                  { method: 'PUT', path: '/api/v1/bpm/{id}/avanzar', desc: 'Avanzar estado del proceso' },
                  { method: 'PUT', path: '/api/v1/bpm/{id}/resultado', desc: 'Registrar resultado final' },
                  { method: 'GET', path: '/api/v1/bpm/procesos', desc: 'Listar todos los procesos' },
                  { method: 'GET', path: '/api/v1/bpm/procesos/lote/{loteId}', desc: 'Procesos por lote' },
                  { method: 'GET', path: '/api/v1/bpm/notificaciones', desc: 'Notificaciones pendientes' },
                  { method: 'PUT', path: '/api/v1/bpm/notificaciones/{id}/leer', desc: 'Marcar notificación leída' },
                  { method: 'POST', path: '/api/v1/bpm/procesos/lote/{loteId}/avanzar', desc: 'Avanzar proceso por lote (usado por fecha salida)' }
                ].map((api, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <Badge variant={api.method === 'POST' ? 'success' : api.method === 'PUT' ? 'info' : 'gray'} className="w-16 justify-center">
                      {api.method}
                    </Badge>
                    <code className="text-xs flex-1">{api.path}</code>
                    <span className="text-xs text-muted-foreground">{api.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CLIENTE SOAP */}
      {activeTab === 'soap' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliente SOAP de Prueba</CardTitle>
              <CardDescription>Envíe requests SOAP al endpoint de Embarcaciones (Puerto 8081)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Request SOAP (XML)</label>
                <div className="relative border rounded-lg bg-gray-900 overflow-hidden" style={{ height: '380px' }}>
                  <pre
                    ref={soapPreRef}
                    className="absolute inset-0 font-mono text-xs p-4 overflow-auto whitespace-pre-wrap break-words pointer-events-none m-0"
                    aria-hidden="true"
                  >
                    <code>{highlightSoapRequest(soapRequest)}</code>
                  </pre>
                  <textarea
                    value={soapRequest}
                    onChange={(e) => setSoapRequest(e.target.value)}
                    onScroll={syncScroll}
                    className="absolute inset-0 w-full h-full font-mono text-xs p-4 bg-transparent text-transparent caret-white resize-none focus:outline-none overflow-auto whitespace-pre-wrap break-words"
                    spellCheck="false"
                    placeholder="Escribe tu SOAP request XML aquí..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={sendSoapRequest} disabled={soapLoading}>
                  {soapLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Enviar Request SOAP
                </Button>
                <Button variant="outline" onClick={() => setSoapRequest(SOAP_REQUEST)}>
                  Restablecer
                </Button>
              </div>
              {soapResponse && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Response SOAP</label>
                  <div className="border rounded-lg bg-gray-900 p-4 max-h-[500px] overflow-auto">
                    <pre className="font-mono text-xs whitespace-pre-wrap break-words">
                      <code>{highlightXml(soapResponse)}</code>
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operaciones SOAP Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { action: 'ObtenerEmbarcaciones', desc: 'Consulta embarcaciones con datos de empresa (ID, nombre o todos)', icon: Truck },
                  { action: 'RegistrarEmbarcacion', desc: 'Registra embarcacion vinculada a una empresa por idEmpresa', icon: Zap },
                  { action: 'ValidarEstadoEmbarcacion', desc: 'Valida estado por matricula, incluye datos de empresa', icon: CheckCircle }
                ].map(op => (
                  <div key={op.action} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <op.icon className="h-4 w-4" />
                      <p className="text-sm font-bold">{op.action}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{op.desc}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        let req = SOAP_REQUEST;
                        if (op.action === 'RegistrarEmbarcacion') {
                          req = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:emb="http://exporsan.com/embarcaciones">
  <soap:Body>
    <emb:RegistrarEmbarcacionRequest>
      <emb:nombreEmbarcacion>Pesquero Demo</emb:nombreEmbarcacion>
      <emb:matricula>PQ-001</emb:matricula>
      <emb:puertoBase>Puerto Maldonado</emb:puertoBase>
      <emb:capacidadToneladas>150.5</emb:capacidadToneladas>
      <emb:nombreCapitan>Anderson Fernandez</emb:nombreCapitan>
      <emb:licenciaCapitan>LIC-12345</emb:licenciaCapitan>
      <emb:idEmpresa>1</emb:idEmpresa>
    </emb:RegistrarEmbarcacionRequest>
  </soap:Body>
</soap:Envelope>`;
                        } else if (op.action === 'ValidarEstadoEmbarcacion') {
                          req = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:emb="http://exporsan.com/embarcaciones">
  <soap:Body>
    <emb:ValidarEstadoEmbarcacionRequest>
      <emb:matricula>PQ-001</emb:matricula>
    </emb:ValidarEstadoEmbarcacionRequest>
  </soap:Body>
</soap:Envelope>`;
                        }
                        setSoapRequest(req);
                      }}
                    >
                      Cargar Ejemplo
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AUDITORÍA */}
      {activeTab === 'auditoria' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Auditoría (AOP)</CardTitle>
              <CardDescription>Logs de todas las operaciones interceptadas por el aspecto de auditoría</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay registros de auditoría</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Timestamp</th>
                        <th className="text-left p-2">Usuario</th>
                        <th className="text-left p-2">Acción</th>
                        <th className="text-left p-2">Entidad</th>
                        <th className="text-left p-2">Servicio</th>
                        <th className="text-left p-2">Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.slice(0, 50).map(log => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 text-xs">{log.id}</td>
                          <td className="p-2 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-2 text-xs">{log.usuarioUsername}</td>
                          <td className="p-2 text-xs">
                            <Badge variant="info">{log.accion}</Badge>
                          </td>
                          <td className="p-2 text-xs">{log.entidad}</td>
                          <td className="p-2 text-xs">{log.servicio}</td>
                          <td className="p-2 text-xs">
                            <Badge variant={log.resultado === 'EXITO' ? 'success' : 'danger'}>
                              {log.resultado}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* REGISTRY UDDI */}
      {activeTab === 'registry' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Registry (Simulación UDDI)</CardTitle>
              <CardDescription>Registro y descubrimiento de servicios</CardDescription>
            </CardHeader>
            <CardContent>
              {registryEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay servicios registrados. Use POST /api/v1/registry/register para registrar servicios.
                </p>
              ) : (
                <div className="space-y-3">
                  {registryEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Server className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{entry.serviceName}</p>
                          <p className="text-xs text-muted-foreground">{entry.serviceUrl}</p>
                          <p className="text-xs text-muted-foreground">{entry.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={entry.status === 'ACTIVE' ? 'success' : 'warning'}>
                          {entry.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">v{entry.version}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>APIs del Registry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { method: 'POST', path: '/api/v1/registry/register', desc: 'Registrar servicio' },
                  { method: 'DELETE', path: '/api/v1/registry/unregister/{name}', desc: 'Desregistrar servicio' },
                  { method: 'PUT', path: '/api/v1/registry/heartbeat/{name}', desc: 'Enviar heartbeat' },
                  { method: 'GET', path: '/api/v1/registry', desc: 'Listar todos los servicios' },
                  { method: 'GET', path: '/api/v1/registry/{name}', desc: 'Buscar servicio por nombre' },
                  { method: 'GET', path: '/api/v1/registry/category/{cat}', desc: 'Buscar por categoría' }
                ].map((api, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <Badge variant={api.method === 'POST' ? 'success' : api.method === 'DELETE' ? 'danger' : api.method === 'PUT' ? 'info' : 'gray'} className="w-16 justify-center">
                      {api.method}
                    </Badge>
                    <code className="text-xs flex-1">{api.path}</code>
                    <span className="text-xs text-muted-foreground">{api.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MÉTRICAS */}
      {activeTab === 'metricas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{SERVICIOS.length}</p>
                  <p className="text-xs text-muted-foreground">Microservicios</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{auditLogs.length}</p>
                  <p className="text-xs text-muted-foreground">Registros Auditoría</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{registryEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Servicios Registrados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{bpmProcesses.length}</p>
                  <p className="text-xs text-muted-foreground">Procesos BPM</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Capas de la Arquitectura SOA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { layer: 'Presentación', desc: 'Next.js 14 PWA + Tailwind CSS + shadcn/ui', techs: ['React 18', 'TypeScript', 'Zustand', 'react-hook-form'], color: 'bg-blue-500' },
                  { layer: 'API Gateway (ESB)', desc: 'Spring Cloud Gateway + filtros globales', techs: ['JWT Filter', 'Transform Filter', 'Rate Limiter', 'Circuit Breaker'], color: 'bg-purple-500' },
                  { layer: 'Servicios de Negocio', desc: '5 microservicios Spring Boot 3.4', techs: ['Auth', 'Lote Pesca', 'Monitoreo', 'Certificación', 'Registry'], color: 'bg-green-500' },
                  { layer: 'Integración', desc: 'SOAP/WSDL + REST + BPM + UDDI', techs: ['SOAP Embarcaciones', 'REST APIs', 'ProcesoNegocio', 'Service Discovery'], color: 'bg-amber-500' },
                  { layer: 'Datos', desc: 'MySQL 8 con bases de datos aisladas', techs: ['exporsan_auth', 'exporsan_lotes', 'exporsan_calidad', 'exporsan_certificacion', 'service_registry'], color: 'bg-red-500' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${item.color} mt-1 flex-shrink-0`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{item.layer}</p>
                      <p className="text-xs text-muted-foreground mb-2">{item.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.techs.map((tech, j) => (
                          <Badge key={j} variant="gray" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
