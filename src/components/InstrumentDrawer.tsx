import React from 'react';
import { X, Activity, Zap, Gauge, Sliders, GripVertical, Cpu } from 'lucide-react';
import { labAudio } from '../utils/audio';

export interface CatalogItem {
  id: string;
  nameEn: string;
  nameAr: string;
  spec: string;
  category: 'measurement' | 'sources' | 'boards';
  theme: {
    iconColor: string;
    iconBg: string;
    borderHover: string;
  };
  icon: React.ReactNode;
}

export const LAB_CATALOG: CatalogItem[] = [
  // Training Board
  {
    id: 'board',
    nameEn: 'EETC TRAINING BOARD',
    nameAr: 'بورد التجارب التعليمي',
    spec: 'RLC • Galv J0409 • Diodes • Transistors',
    category: 'boards',
    theme: {
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-950/50 border-amber-700/40',
      borderHover: 'hover:border-amber-500/50 hover:bg-amber-950/30',
    },
    icon: <Cpu className="w-3.5 h-3.5 text-amber-400" />,
  },

  // Passive and active filter trainer board
  {
    id: 'filterboard',
    nameEn: 'PASSIVE & ACTIVE FILTER BOARD',
    nameAr: 'بورد المرشحات الفعالة والسلبية',
    spec: 'Active LPF / HPF • Passive LPF / HPF / BPF',
    category: 'boards',
    theme: {
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-950/50 border-blue-700/40',
      borderHover: 'hover:border-blue-500/50 hover:bg-blue-950/30',
    },
    icon: <Cpu className="w-3.5 h-3.5 text-blue-400" />,
  },

  // Measurement & Analysis
  {
    id: 'scope',
    nameEn: 'UTD2102CEX+',
    nameAr: 'راسم إشارة رقمي',
    spec: '100MHz • 1GS/s Storage Scope',
    category: 'measurement',
    theme: {
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-950/50 border-cyan-700/40',
      borderHover: 'hover:border-cyan-500/50 hover:bg-cyan-950/30',
    },
    icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    id: 'dmm',
    nameEn: 'UNI-T UT33D+',
    nameAr: 'أفوميتر رقمي دقيق',
    spec: '3½ Digits • NCV • Backlight',
    category: 'measurement',
    theme: {
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-950/50 border-emerald-700/40',
      borderHover: 'hover:border-emerald-500/50 hover:bg-emerald-950/30',
    },
    icon: <Gauge className="w-3.5 h-3.5 text-emerald-400" />,
  },

  // Signal & Power Sources
  {
    id: 'gen',
    nameEn: 'LW-1641 2MHz',
    nameAr: 'مولد ترددات وإشارات',
    spec: 'Function Gen & Intelligent Counter',
    category: 'sources',
    theme: {
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-950/50 border-sky-700/40',
      borderHover: 'hover:border-sky-500/50 hover:bg-sky-950/30',
    },
    icon: <Zap className="w-3.5 h-3.5 text-sky-400" />,
  },
  {
    id: 'psu',
    nameEn: 'ATTEN APS3005S',
    nameAr: 'مزود قدرة مستمر',
    spec: 'Regulated DC 30V / 5A (CV/CC)',
    category: 'sources',
    theme: {
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-950/50 border-indigo-700/40',
      borderHover: 'hover:border-indigo-500/50 hover:bg-indigo-950/30',
    },
    icon: <Sliders className="w-3.5 h-3.5 text-indigo-400" />,
  },
];

interface InstrumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInstrument: (type: string, dropCoords?: { x: number; y: number }) => void;
  onDragStartItem?: (type: string) => void;
  onDragEndItem?: () => void;
}

export const InstrumentDrawer: React.FC<InstrumentDrawerProps> = ({
  isOpen,
  onClose,
  onAddInstrument,
  onDragStartItem,
  onDragEndItem,
}) => {
  const boardItems = LAB_CATALOG.filter((i) => i.category === 'boards');
  const measurementItems = LAB_CATALOG.filter((i) => i.category === 'measurement');
  const sourceItems = LAB_CATALOG.filter((i) => i.category === 'sources');

  const handleDragStart = (e: React.DragEvent, typeId: string) => {
    e.dataTransfer.setData('application/lab-instrument', typeId);
    e.dataTransfer.setData('text/plain', typeId);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStartItem?.(typeId);
  };

  return (
    // Floating Docked Toolbox (NO backdrop overlay blocking the workbench)
    <aside
      className={`fixed top-14 left-3 bottom-4 w-[280px] max-w-[85vw] bg-[#0c1017]/95 backdrop-blur-md rounded-2xl border border-neutral-800/90 shadow-[0_16px_50px_rgba(0,0,0,0.85)] z-40 flex flex-col text-neutral-100 select-none transition-all duration-300 ease-out font-arabic ${
        isOpen
          ? 'translate-x-0 opacity-100 pointer-events-auto'
          : '-translate-x-[115%] opacity-0 pointer-events-none'
      }`}
    >
      {/* Sleek Minimal Header */}
      <div className="px-3.5 py-2.5 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-950/60 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
          <h2 className="text-[11px] font-mono font-bold tracking-wider text-neutral-200 uppercase">
            CATALOG • الأجهزة
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="إغلاق القائمة"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Helper Tag */}
      <div className="px-3 pt-2 pb-0.5 text-[10px] text-neutral-400 font-arabic">
        اسحب الجهاز إلى الطاولة أو انقر لإضافته:
      </div>

      {/* Compact Cards List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-3">
        {/* Category 0: Experiment Training Boards */}
        <div>
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-amber-400/90 mb-1 px-1">
            EXPERIMENT BOARDS • بوردات التجارب
          </div>

          <div className="space-y-1">
            {boardItems.map((item) => (
              <div
                key={item.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragEnd={() => onDragEndItem?.()}
                onClick={() => {
                  labAudio.playPlugSnap();
                  onAddInstrument(item.id);
                }}
                className={`p-2 px-2.5 rounded-xl border border-neutral-800/90 bg-[#121620] ${item.theme.borderHover} hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all cursor-grab active:cursor-grabbing group shadow-md flex items-center justify-between`}
                title={`اسحب ${item.nameAr} إلى الطاولة أو انقر للإضافة`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden pr-1">
                  <div className={`p-2 rounded-lg border ${item.theme.iconBg} flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner`}>
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <div className="text-[11.5px] font-black text-white font-mono leading-tight group-hover:text-amber-300 transition-colors truncate">
                      {item.nameEn}
                    </div>
                    <div className="text-[10.5px] font-bold text-neutral-200 tracking-normal truncate">
                      {item.nameAr}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-neutral-500 group-hover:text-neutral-200 transition-colors flex-shrink-0 pl-1">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 1: Measurement */}
        <div>
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-cyan-400/90 mb-1 px-1">
            MEASUREMENT • أجهزة القياس
          </div>

          <div className="space-y-1">
            {measurementItems.map((item) => (
              <div
                key={item.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragEnd={() => onDragEndItem?.()}
                onClick={() => {
                  labAudio.playPlugSnap();
                  onAddInstrument(item.id);
                }}
                className={`p-2 px-2.5 rounded-xl border border-neutral-800/90 bg-[#121620] ${item.theme.borderHover} hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all cursor-grab active:cursor-grabbing group shadow-md flex items-center justify-between`}
                title={`اسحب ${item.nameAr} إلى الطاولة أو انقر للإضافة`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden pr-1">
                  <div className={`p-2 rounded-lg border ${item.theme.iconBg} flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner`}>
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <div className="text-[11.5px] font-black text-white font-mono leading-tight group-hover:text-cyan-300 transition-colors truncate">
                      {item.nameEn}
                    </div>
                    <div className="text-[10.5px] font-bold text-neutral-200 tracking-normal truncate">
                      {item.nameAr}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-neutral-500 group-hover:text-neutral-200 transition-colors flex-shrink-0 pl-1">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 2: Sources */}
        <div>
          <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-sky-400/90 mb-1 px-1">
            SOURCES • مصادر التغذية والإشارة
          </div>

          <div className="space-y-1">
            {sourceItems.map((item) => (
              <div
                key={item.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragEnd={() => onDragEndItem?.()}
                onClick={() => {
                  labAudio.playPlugSnap();
                  onAddInstrument(item.id);
                }}
                className={`p-2 px-2.5 rounded-xl border border-neutral-800/90 bg-[#121620] ${item.theme.borderHover} hover:shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all cursor-grab active:cursor-grabbing group shadow-md flex items-center justify-between`}
                title={`اسحب ${item.nameAr} إلى الطاولة أو انقر للإضافة`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden pr-1">
                  <div className={`p-2 rounded-lg border ${item.theme.iconBg} flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner`}>
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <div className="text-[11.5px] font-black text-white font-mono leading-tight group-hover:text-sky-300 transition-colors truncate">
                      {item.nameEn}
                    </div>
                    <div className="text-[10.5px] font-bold text-neutral-200 tracking-normal truncate">
                      {item.nameAr}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-neutral-500 group-hover:text-neutral-200 transition-colors flex-shrink-0 pl-1">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="p-2 bg-neutral-950/80 border-t border-neutral-800/80 text-[9px] text-neutral-400 text-center font-mono rounded-b-2xl">
        DRAG & DROP TO BENCH
      </div>
    </aside>
  );
};
