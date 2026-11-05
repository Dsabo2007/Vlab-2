import React from 'react';
import {
  Menu,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Trash2,
  LocateFixed,
  GraduationCap,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface ToolbarProps {
  onOpenDrawer: () => void;
  isDrawerOpen: boolean;
  wireColor: string;
  onSelectWireColor: (color: string) => void;
  wiresVisible: boolean;
  onToggleWires: () => void;
  onClearWires: () => void;
  onResetView: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpenDrawer,
  isDrawerOpen,
  wireColor,
  onSelectWireColor,
  wiresVisible,
  onToggleWires,
  onClearWires,
  onResetView,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  audioEnabled,
  onToggleAudio,
}) => {
  const WIRE_COLORS = [
    { id: 'red', name: 'Red (+)', bg: 'bg-red-500', ring: 'ring-red-400' },
    { id: 'black', name: 'Black (-/GND)', bg: 'bg-neutral-900 border border-neutral-500', ring: 'ring-neutral-300' },
    { id: 'blue', name: 'Blue (Signal)', bg: 'bg-sky-500', ring: 'ring-sky-400' },
    { id: 'yellow', name: 'Yellow (CH2)', bg: 'bg-amber-400', ring: 'ring-amber-300' },
    { id: 'green', name: 'Green (Earth)', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  ];

  return (
    <header className="bg-[#0e1117]/98 backdrop-blur text-white px-2 sm:px-4 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 shadow-xl border-b border-neutral-800 z-40 select-none shrink-0">
      {/* Left: drawer + branding */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenDrawer}
          className={`p-2 rounded-xl border transition-all shrink-0 ${
            isDrawerOpen
              ? 'bg-neutral-800 border-neutral-600 text-white shadow-inner'
              : 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700/80 shadow-md'
          }`}
          title="الأجهزة (Instruments Shelf)"
          aria-label="Open instrument shelf"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0 sm:pl-2 sm:border-l border-neutral-800">
          <div className="p-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 shrink-0 hidden xs:block">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[10px] sm:text-xs font-black tracking-wider text-neutral-100 uppercase font-mono truncate">
              <span className="hidden md:inline">ELECTRICAL AND ELECTRONIC TECHNICAL COLLEGE</span>
              <span className="md:hidden">VIRTUAL ELECTRONICS LAB</span>
            </h1>
            <p className="text-[9.5px] sm:text-[10.5px] text-neutral-400 font-medium font-arabic truncate">
              مختبر الدوائر والقياسات الافتراضي
            </p>
          </div>
        </div>
      </div>

      {/* Middle: wire palette (scrolls horizontally on narrow phones) */}
      <div className="order-3 sm:order-none w-full sm:w-auto flex items-center gap-2 bg-neutral-900/95 px-2.5 py-1 rounded-xl border border-neutral-800 shadow-inner overflow-x-auto">
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 shrink-0">
          WIRE
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {WIRE_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectWireColor(c.id)}
              className={`w-5 h-5 rounded-full ${c.bg} shadow-md transition-all shrink-0 ${
                wireColor === c.id
                  ? `scale-125 ring-2 ring-offset-2 ring-offset-[#0e1117] ${c.ring} shadow-lg`
                  : 'hover:scale-110 opacity-70 hover:opacity-100'
              }`}
              title={`Wire Color: ${c.name}`}
              aria-label={`Select ${c.name} wire`}
            />
          ))}
        </div>

        <div className="h-4 w-px bg-neutral-800 mx-0.5 shrink-0" />

        <button
          onClick={onToggleWires}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 ${
            wiresVisible
              ? 'text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800'
              : 'text-amber-400 bg-amber-950/40 border border-amber-800/50'
          }`}
          title={wiresVisible ? 'إخفاء الأسلاك' : 'إظهار الأسلاك'}
        >
          {wiresVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onClearWires}
          className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg text-xs transition-colors shrink-0"
          title="حذف جميع الأسلاك (Clear all wires)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: view controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center bg-neutral-900/95 px-1.5 sm:px-2 py-1 rounded-xl border border-neutral-800 shadow-inner gap-0.5 sm:gap-1">
          <button
            onClick={onZoomOut}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all"
            title="تصغير"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-sky-400 px-0.5 min-w-[34px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all"
            title="تكبير"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-neutral-800 mx-0.5" />
          <button
            onClick={onFitView}
            className="p-1 rounded-lg text-neutral-400 hover:text-sky-300 hover:bg-neutral-800 active:scale-95 transition-all"
            title="ملاءمة كل الأجهزة على الشاشة"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onResetView}
          className="px-2 sm:px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-700/80 flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-colors active:scale-95"
          title="إعادة توسيط اللوحة"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono hidden sm:inline">CENTER</span>
        </button>

        <button
          onClick={onToggleAudio}
          className={`p-1.5 rounded-lg border transition-colors ${
            audioEnabled
              ? 'bg-neutral-900 text-neutral-300 border-neutral-700/80 hover:text-white'
              : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
          }`}
          title={audioEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
