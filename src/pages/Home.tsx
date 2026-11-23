import React, { useMemo, useRef, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
  RefresherEventDetail,
} from '@ionic/react';
import {
  addOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  closeOutline,
  layersOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { FilterOption, Incident, IncidentPriority } from '../types/incident';

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    title: 'Fallo de enlace en Switch Rack B',
    location: 'Aula 204 - Redes',
    description: 'Pérdida intermitente de paquetes en puertos Gigabit 12 al 16.',
    priority: 'alta',
    status: 'pendiente',
    createdAt: '09:15',
  },
  {
    id: 'INC-102',
    title: 'Actualización de imágenes Docker',
    location: 'Laboratorio DAM 2',
    description: 'Desplegar imagen base Node 22 Alpine en estaciones de trabajo.',
    priority: 'media',
    status: 'pendiente',
    createdAt: '10:30',
  },
  {
    id: 'INC-103',
    title: 'Calibración de proyector láser',
    location: 'Aula Magna',
    description: 'Ajuste trapezoidal y verificación de entrada HDMI.',
    priority: 'baja',
    status: 'resuelta',
    createdAt: 'Ayer',
  },
];

const PRIORITY_BADGE_STYLES: Record<IncidentPriority, string> = {
  alta: 'bg-red-400 text-black border-2 border-black',
  media: 'bg-yellow-300 text-black border-2 border-black',
  baja: 'bg-emerald-300 text-black border-2 border-black',
};

const Home: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('todas');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<IncidentPriority>('media');

  const listRef = useRef<HTMLIonListElement | null>(null);

  const metrics = useMemo(() => {
    const total = incidents.length;
    const pending = incidents.filter((item) => item.status === 'pendiente').length;
    const resolved = incidents.filter((item) => item.status === 'resuelta').length;
    const critical = incidents.filter(
      (item) => item.status === 'pendiente' && item.priority === 'alta'
    ).length;
    return { total, pending, resolved, critical };
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return incidents.filter((item) => {
      const matchesStatus = activeFilter === 'todas' || item.status === activeFilter;
      const matchesQuery =
        normalizedQuery === '' ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.location.toLowerCase().includes(normalizedQuery) ||
        item.id.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [incidents, activeFilter, searchQuery]);

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      setToastMessage('SISTEMA SINCRONIZADO // OK');
      event.detail.complete();
    }, 600);
  };

  const handleToggleStatus = async (id: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'pendiente' ? 'resuelta' : 'pendiente' }
          : item
      )
    );
    await listRef.current?.closeSlidingItems();
    setToastMessage(`ESTADO DE ${id} ACTUALIZADO`);
  };

  const handleDeleteIncident = async (id: string) => {
    setIncidents((prev) => prev.filter((item) => item.id !== id));
    await listRef.current?.closeSlidingItems();
    setToastMessage(`REGISTRO ${id} ELIMINADO`);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setToastMessage('ERROR: TÍTULO Y UBICACIÓN OBLIGATORIOS');
      return;
    }

    const newIncident: Incident = {
      id: `INC-${Math.floor(104 + Math.random() * 895)}`,
      title: title.trim(),
      location: location.trim(),
      description: description.trim() || 'Sin observaciones técnicas adicionales.',
      priority,
      status: 'pendiente',
      createdAt: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setTitle('');
    setLocation('');
    setDescription('');
    setPriority('media');
    setIsModalOpen(false);
    setToastMessage(`INCIDENCIA ${newIncident.id} CREADA`);
  };

  return (
    <IonPage>
      {/* CABECERA BRUTALISTA */}
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary" className="px-2">
          <IonTitle className="font-mono text-base font-black uppercase tracking-tighter text-black sm:text-xl">
            [SMARTLAB // MONITOR_OS]
          </IonTitle>
          <IonButtons slot="end">
            <div className="mr-2 flex items-center gap-2 border-2 border-black bg-white px-3 py-1 shadow-[3px_3px_0px_0px_#000]">
              <span className="hidden font-mono text-xs font-bold uppercase text-black sm:inline">
                ACTIVAS:
              </span>
              <span className="font-mono text-sm font-black text-black">
                {metrics.pending}
              </span>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-amber-50">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="TIRA PARA ACTUALIZAR"
            refreshingSpinner="crescent"
            refreshingText="SINCRONIZANDO..."
          />
        </IonRefresher>

        {/* CONTENEDOR MAESTRO CON ALTURA MÍNIMA DE VIEWPORT (100vh) */}
        <div className="mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between px-4 pb-24 pt-5 sm:px-6 lg:px-8">
          
          {/* BLOQUE 1: KPI PANEL (MIN-H 22vh) */}
          <section
            aria-label="Resumen de métricas"
            className="mb-6 flex min-h-[22vh] flex-col justify-center"
          >
            <div className="mb-3 flex items-center justify-between border-b-2 border-black pb-1">
              <h2 className="font-mono text-xs font-black uppercase tracking-widest text-black">
                01 // TELEMETRÍA DEL SISTEMA
              </h2>
              <span className="bg-black px-2 py-0.5 font-mono text-[10px] font-bold text-yellow-300">
                LIVE_DATA
              </span>
            </div>

            {/* RWD KPIs: 2 cols en Mobile | 4 cols en Tablet y Desktop */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="cursor-pointer border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black">
                    TOTAL
                  </span>
                  <IonIcon icon={layersOutline} className="text-xl text-black" />
                </div>
                <p className="mt-2 font-mono text-3xl font-black text-black">
                  {metrics.total}
                </p>
              </div>

              <div className="cursor-pointer border-2 border-black bg-yellow-300 p-4 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black">
                    PENDIENTES
                  </span>
                  <IonIcon icon={timeOutline} className="text-xl text-black" />
                </div>
                <p className="mt-2 font-mono text-3xl font-black text-black">
                  {metrics.pending}
                </p>
              </div>

              <div className="cursor-pointer border-2 border-black bg-red-400 p-4 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black">
                    CRÍTICAS
                  </span>
                  <IonIcon icon={alertCircleOutline} className="text-xl text-black" />
                </div>
                <p className="mt-2 font-mono text-3xl font-black text-black">
                  {metrics.critical}
                </p>
              </div>

              <div className="cursor-pointer border-2 border-black bg-emerald-300 p-4 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black">
                    RESUELTAS
                  </span>
                  <IonIcon icon={checkmarkCircleOutline} className="text-xl text-black" />
                </div>
                <p className="mt-2 font-mono text-3xl font-black text-black">
                  {metrics.resolved}
                </p>
              </div>
            </div>
          </section>

          {/* BLOQUE 2: ÁREA OPERATIVA RWD (MIN-H 64vh) */}
          {/* En Desktop (lg) se divide en 2 columnas: Controles a la izquierda, Listado a la derecha */}
          <div className="grid min-h-[64vh] grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            
            {/* COLUMNA IZQUIERDA (FILTROS Y CONTROLES) */}
            <section
              aria-label="Filtros de búsqueda"
              className="space-y-4 border-2 border-black bg-cyan-200 p-4 shadow-[6px_6px_0px_0px_#000] lg:sticky lg:top-4 lg:col-span-4"
            >
              <h2 className="border-b-2 border-black pb-1 font-mono text-xs font-black uppercase tracking-widest text-black">
                02 // CONSOLA DE FILTRADO
              </h2>

              <IonSearchbar
                value={searchQuery}
                onIonInput={(e) => setSearchQuery(e.detail.value ?? '')}
                placeholder="BUSCAR ID, TÍTULO O AULA..."
                debounce={150}
                className="brutal-search"
                aria-label="Buscar incidencias"
              />

              <div className="pt-1">
                <p className="mb-1.5 font-mono text-[11px] font-bold uppercase text-black">
                  ESTADO DE INCIDENCIA:
                </p>
                <IonSegment
                  value={activeFilter}
                  className="brutal-segment"
                  onIonChange={(e) =>
                    setActiveFilter((e.detail.value as FilterOption) ?? 'todas')
                  }
                >
                  <IonSegmentButton value="todas">
                    <IonLabel className="text-xs">TODAS ({metrics.total})</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="pendiente">
                    <IonLabel className="text-xs">PEND. ({metrics.pending})</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="resuelta">
                    <IonLabel className="text-xs">OK ({metrics.resolved})</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </div>

              <div className="hidden border-t-2 border-black pt-3 lg:block">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full border-2 border-black bg-yellow-300 px-4 py-3 font-mono text-xs font-black uppercase text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-black hover:text-yellow-300 active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  + REGISTRAR NUEVA INCIDENCIA
                </button>
              </div>
            </section>

            {/* COLUMNA DERECHA (LISTADO DE INCIDENCIAS) */}
            <section aria-label="Listado de incidencias" className="lg:col-span-8">
              <div className="mb-3 flex items-center justify-between border-b-2 border-black pb-1">
                <h2 className="font-mono text-xs font-black uppercase tracking-widest text-black">
                  03 // LOG DE INCIDENCIAS ({filteredIncidents.length})
                </h2>
                <span className="font-mono text-[11px] font-bold text-black">
                  [DESLIZA O PULSA ESTADO]
                </span>
              </div>

              {filteredIncidents.length === 0 ? (
                <div className="flex min-h-[30vh] flex-col items-center justify-center border-2 border-dashed border-black bg-white p-8 text-center shadow-[4px_4px_0px_0px_#000]">
                  <p className="font-mono text-sm font-black uppercase text-black">
                    SIN REGISTROS EN ESTA CONSULTA
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-700">
                    Modifica los parámetros de búsqueda o crea un nuevo ticket.
                  </p>
                </div>
              ) : (
                /* RWD Listado: 1 col en Mobile | 2 cols en Tablet y Desktop */
                <IonList
                  ref={listRef}
                  lines="none"
                  className="grid grid-cols-1 gap-4 bg-transparent p-0 md:grid-cols-2"
                >
                  {filteredIncidents.map((incident) => (
                    <IonItemSliding
                      key={incident.id}
                      className="overflow-visible border-2 border-black bg-white shadow-[5px_5px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#000]"
                    >
                      <IonItem className="--background: #ffffff; --padding-start: 16px; --inner-padding-end: 16px;">
                        <div className="flex h-full w-full flex-col justify-between py-3">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-black px-2 py-0.5 font-mono text-xs font-black text-white">
                                  {incident.id}
                                </span>
                                <span
                                  className={`px-2 py-0.5 font-mono text-xs font-black uppercase ${
                                    PRIORITY_BADGE_STYLES[incident.priority]
                                  }`}
                                >
                                  {incident.priority}
                                </span>
                              </div>
                              <span className="font-mono text-xs font-bold text-black">
                                {incident.createdAt}
                              </span>
                            </div>

                            <h3
                              className={`mt-2.5 font-mono text-base font-black uppercase leading-snug ${
                                incident.status === 'resuelta'
                                  ? 'text-zinc-500 line-through'
                                  : 'text-black'
                              }`}
                            >
                              {incident.title}
                            </h3>

                            <p className="mt-1.5 font-mono text-xs leading-relaxed text-zinc-800">
                              {incident.description}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t-2 border-black pt-2.5">
                            <span className="font-mono text-xs font-bold text-black">
                              LOC: <span className="underline">{incident.location}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(incident.id)}
                              className={`border-2 border-black px-2.5 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                                incident.status === 'resuelta'
                                  ? 'bg-emerald-300 text-black'
                                  : 'bg-yellow-300 text-black'
                              }`}
                            >
                              {incident.status === 'resuelta' ? '✓ RESUELTA' : '● PENDIENTE'}
                            </button>
                          </div>
                        </div>
                      </IonItem>

                      {/* OPCIONES AL DESLIZAR */}
                      <IonItemOptions side="end" className="border-l-2 border-black">
                        <IonItemOption
                          color="success"
                          onClick={() => handleToggleStatus(incident.id)}
                          className="border-r-2 border-black"
                        >
                          <IonIcon slot="icon-only" icon={checkmarkCircleOutline} />
                        </IonItemOption>
                        <IonItemOption
                          color="danger"
                          onClick={() => handleDeleteIncident(incident.id)}
                        >
                          <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonItemOption>
                      </IonItemOptions>
                    </IonItemSliding>
                  ))}
                </IonList>
              )}
            </section>
          </div>
        </div>

        {/* BOTÓN FLOTANTE BRUTALISTA (MÓVIL/TABLET) */}
        <IonFab slot="fixed" vertical="bottom" horizontal="end" className="mb-3 mr-3">
          <IonFabButton
            className="brutal-fab"
            onClick={() => setIsModalOpen(true)}
            aria-label="Registrar nueva incidencia"
          >
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* MODAL DE ALTA CON ESTÉTICA BRUTALISTA */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader className="ion-no-border">
            <IonToolbar color="primary">
              <IonTitle className="font-mono text-sm font-black uppercase text-black">
                [NUEVO_TICKET_INCIDENCIA]
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Cerrar formulario"
                >
                  <IonIcon icon={closeOutline} className="text-black" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding bg-amber-50">
            <form onSubmit={handleCreateIncident} className="space-y-4 pt-2">
              <IonItem className="border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <IonInput
                  label="TÍTULO DE LA INCIDENCIA *"
                  labelPlacement="stacked"
                  placeholder="Ej. Error de compilación en SDK"
                  value={title}
                  onIonInput={(e) => setTitle(e.detail.value ?? '')}
                  required
                />
              </IonItem>

              <IonItem className="border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <IonInput
                  label="AULA O UBICACIÓN *"
                  labelPlacement="stacked"
                  placeholder="Ej. Laboratorio 102"
                  value={location}
                  onIonInput={(e) => setLocation(e.detail.value ?? '')}
                  required
                />
              </IonItem>

              <IonItem className="border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <IonSelect
                  label="NIVEL DE PRIORIDAD"
                  labelPlacement="stacked"
                  value={priority}
                  onIonChange={(e) => setPriority(e.detail.value as IncidentPriority)}
                >
                  <IonSelectOption value="alta">ALTA (CRÍTICA)</IonSelectOption>
                  <IonSelectOption value="media">MEDIA (OPERATIVA)</IonSelectOption>
                  <IonSelectOption value="baja">BAJA (MANTENIMIENTO)</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem className="border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <IonTextarea
                  label="DESCRIPCIÓN TÉCNICA"
                  labelPlacement="stacked"
                  rows={4}
                  placeholder="Detalla los síntomas observados..."
                  value={description}
                  onIonInput={(e) => setDescription(e.detail.value ?? '')}
                />
              </IonItem>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full border-2 border-black bg-yellow-300 py-3.5 font-mono text-sm font-black uppercase text-black shadow-[5px_5px_0px_0px_#000] transition-all hover:bg-black hover:text-yellow-300 active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  GUARDAR INCIDENCIA
                </button>
              </div>
            </form>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={toastMessage !== null}
          message={toastMessage ?? ''}
          duration={2200}
          position="bottom"
          onDidDismiss={() => setToastMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;