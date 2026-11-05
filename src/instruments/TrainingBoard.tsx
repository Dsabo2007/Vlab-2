import React, { useState } from 'react';
import { X, GripHorizontal } from 'lucide-react';
import { Port } from '../types/lab';
import { labAudio } from '../utils/audio';

export interface TrainingBoardProps {
  instanceId: string;
  ports: Port[];
  connectedPortIds: Set<string>;
  portConnectionCounts?: Map<string, number>;
  wiringSourcePort: Port | null;
  onPortClick: (port: Port) => void;
  onClose: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  potValue?: number; // 0 to 100 (%)
  onPotChange?: (val: number) => void;
}

export const TrainingBoard: React.FC<TrainingBoardProps> = ({
  instanceId,
  ports,
  connectedPortIds,
  portConnectionCounts,
  wiringSourcePort,
  onPortClick,
  onClose,
  onDragStart,
  potValue = 50,
  onPotChange,
}) => {
  const [internalPot, setInternalPot] = useState(potValue);

  const handlePotSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setInternalPot(val);
    onPotChange?.(val);
  };

  // Helper to find a port by suffix
  const getPort = (suffix: string) => {
    return ports.find((p) => p.id === `${instanceId}:${suffix}`);
  };

  // ---------------------------------------------------------------------
  // High-visibility 4mm banana socket. Every role gets its own colour, a
  // white halo so it stands out from the cream board, an IN/OUT tag and a
  // numeric badge once several leads are stacked on the same jack.
  // ---------------------------------------------------------------------
  const SOCKET_ROLES = {
    red: { ring: '#dc2626', halo: 'rgba(239,68,68,0.35)', tag: '+', tagBg: '#dc2626', text: '#b91c1c' },
    black: { ring: '#334155', halo: 'rgba(15,23,42,0.28)', tag: 'GND', tagBg: '#1e293b', text: '#334155' },
    blue: { ring: '#0284c7', halo: 'rgba(2,132,199,0.32)', tag: 'SIG', tagBg: '#0284c7', text: '#075985' },
    yellow: { ring: '#d97706', halo: 'rgba(245,158,11,0.38)', tag: 'IN', tagBg: '#b45309', text: '#92400e' },
    green: { ring: '#059669', halo: 'rgba(16,185,129,0.38)', tag: 'OUT', tagBg: '#047857', text: '#065f46' },
  } as const;

  const renderBananaSocket = (
    portSuffix: string,
    color: keyof typeof SOCKET_ROLES = 'red',
    label?: string,
    customTooltip?: string
  ) => {
    const port = getPort(portSuffix);
    if (!port) return null;

    const isConnected = connectedPortIds.has(port.id);
    const isWiringSource = wiringSourcePort?.id === port.id;
    const stacked = portConnectionCounts?.get(port.id) ?? 0;
    const role = SOCKET_ROLES[color];

    return (
      <div className="flex flex-col items-center group/socket select-none relative">
        <button
          type="button"
          data-port-id={port.id}
          data-port-role={role.tag}
          onClick={(e) => {
            e.stopPropagation();
            labAudio.playPlugSnap();
            onPortClick(port);
          }}
          className={`relative w-[27px] h-[27px] rounded-full border-[3px] flex items-center justify-center transition-transform ${
            isWiringSource
              ? 'ring-2 ring-cyan-400 scale-125 z-30 shadow-[0_0_14px_#22d3ee]'
              : 'hover:scale-110'
          }`}
          style={{
            borderColor: role.ring,
            background: `radial-gradient(circle at 35% 30%, #ffffff 0%, #d7dbe0 38%, #9aa3ad 100%)`,
            boxShadow: isConnected
              ? `0 0 0 2px #ffffff, 0 0 10px 2px ${role.halo}, inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 3px rgba(0,0,0,0.35)`
              : '0 0 0 2px rgba(255,255,255,0.9), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 3px rgba(0,0,0,0.3)',
          }}
          title={customTooltip || `${port.name} — ${role.tag} • ${stacked > 0 ? `${stacked} سلك موصول` : 'غير موصول'}`}
        >
          {/* Coloured centre contact — lights up when a lead is inserted */}
          <div
            className="w-[9px] h-[9px] rounded-full border border-black/40 flex items-center justify-center"
            style={{
              backgroundColor: isConnected ? '#fbbf24' : role.ring,
              boxShadow: isConnected ? '0 0 8px #f59e0b' : 'inset 0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            <div className="w-[3px] h-[3px] rounded-full bg-black/80" />
          </div>

          {/* Role tag (IN / OUT / + / GND / SIG) */}
          <span
            className="absolute -top-[7px] -right-[9px] text-[6.5px] font-mono font-black text-white px-[3px] py-[0.5px] rounded-sm shadow-sm leading-none"
            style={{ backgroundColor: role.tagBg }}
          >
            {role.tag}
          </span>

          {/* Stacked-lead counter */}
          {stacked > 1 && (
            <span className="absolute -bottom-[6px] -left-[7px] min-w-[14px] h-[14px] px-[2px] rounded-full bg-sky-600 text-white text-[8px] font-black flex items-center justify-center border border-white shadow">
              {stacked}
            </span>
          )}
        </button>
        {label && (
          <span
            className="text-[9px] font-mono font-black mt-0.5 leading-none"
            style={{ color: role.text }}
          >
            {label}
          </span>
        )}
      </div>
    );
  };

  // Printed resistor symbol on the trainer-board silk screen, with banana sockets at both ends.
  const renderResistorItem = (
    label: string,
    valStr: string,
    portA: string,
    portB: string,
    _bands: string[]
  ) => {
    return (
      <div className="flex items-center gap-1.5 min-w-0 px-1 py-1.5 border-b border-[#d8d4c8]">
        {renderBananaSocket(portA, 'red')}
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <span className="text-[9px] font-mono font-bold text-[#254c83] leading-none mb-1">{valStr}</span>
          <svg viewBox="0 0 116 22" className="w-full h-5 overflow-visible" aria-label={`Resistor ${valStr}`}>
            <line x1="0" y1="11" x2="12" y2="11" stroke="#24518a" strokeWidth="1.7" />
            <polyline points="12,11 18,4 25,18 32,4 39,18 46,4 53,18 60,4 67,18 74,4 81,18 88,4 95,11 104,11"
              fill="none" stroke="#24518a" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" />
            <line x1="104" y1="11" x2="116" y2="11" stroke="#24518a" strokeWidth="1.7" />
          </svg>
          <span className="text-[8px] font-mono text-[#64748b] leading-none mt-0.5">{label}</span>
        </div>
        {renderBananaSocket(portB, 'black')}
      </div>
    );
  };

  // Printed capacitor symbol on the cream PCB faceplate.
  const renderCapacitorItem = (
    label: string,
    valStr: string,
    portA: string,
    portB: string,
    isElectrolytic: boolean = false
  ) => {
    return (
      <div className="flex items-center gap-1.5 min-w-0 px-1 py-1.5 border-b border-[#d8d4c8]">
        {renderBananaSocket(portA, 'red')}
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <span className="text-[9px] font-mono font-bold text-[#254c83] leading-none mb-1">{valStr}</span>
          <svg viewBox="0 0 116 22" className="w-full h-5 overflow-visible" aria-label={`Capacitor ${valStr}`}>
            <line x1="0" y1="11" x2="45" y2="11" stroke="#24518a" strokeWidth="1.8" />
            <line x1="48" y1="2" x2="48" y2="20" stroke="#24518a" strokeWidth="2.2" />
            <line x1="57" y1="2" x2="57" y2="20" stroke="#24518a" strokeWidth="2.2" />
            <line x1="60" y1="11" x2="116" y2="11" stroke="#24518a" strokeWidth="1.8" />
            {isElectrolytic && <text x="51" y="8" fill="#24518a" fontSize="7" fontWeight="bold">+</text>}
          </svg>
          <span className="text-[8px] font-mono text-[#64748b] leading-none mt-0.5">{label}</span>
        </div>
        {renderBananaSocket(portB, isElectrolytic ? 'black' : 'blue')}
      </div>
    );
  };

  return (
    <div
      style={{ width: '1120px' }}
      className="bg-[#e9e6dc] rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.55)] border-[8px] border-[#aab2b8] text-neutral-900 select-none overflow-hidden flex flex-col font-sans"
    >
      {/* Top Metallic Handle & Drag Bar */}
      <div
        onPointerDown={onDragStart}
        style={{ touchAction: 'none' }}
        className="bg-gradient-to-b from-[#d8dce0] via-[#aeb7bf] to-[#d4d8dc] px-4 py-1.5 flex items-center justify-between cursor-move text-[#203b5d] shadow-inner select-none border-b border-[#8b969e]"
        title="اسحب اللوحة لتحريكها بحرية (Drag to reposition Training Board)"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-5 h-5 text-slate-600" />
          <span className="text-xs font-black font-mono tracking-wider uppercase text-[#244c7b]">
            ELECTRONICS EXPERIMENT TRAINING BOARD • بورد التجارب التعليمي
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
            COLLEGE LAB MODEL • ET-LAB-01
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-600 hover:text-white hover:bg-rose-600/80 transition-colors"
            title="إخفاء لوحة التجارب (Hide Board)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Board Faceplate (White Silk-screened Panel) */}
      <div className="p-4 bg-[#f3f0e6] flex flex-col gap-3 relative">
        {/* College Silk-Screen Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#244c7b] pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-900 border border-sky-700 flex items-center justify-center text-white font-black text-xs shadow-inner">
              EETC
            </div>
            <div>
              <div className="text-xs font-black text-sky-950 font-mono tracking-wider uppercase">
                ELECTRONICS EXPERIMENT BOARD
              </div>
              <div className="text-[10.5px] font-bold text-neutral-600 font-arabic">
                COMPUTER ENGINEERING TECHNIQUES
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-black font-mono text-sky-900 uppercase tracking-widest">
              ELECTRONICS EXPERIMENT BOARD
            </div>
            <div className="text-[10px] font-mono text-neutral-500 font-bold">
              CAPACITORS / RESISTORS / SEMICONDUCTORS / OP-AMP
            </div>
          </div>
        </div>

        {/* Colour legend — makes every input / output readable from a distance */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-white/70 border border-[#c9c5b9] rounded-md px-2 py-1.5">
          <span className="text-[9.5px] font-arabic font-black text-[#244c7b]">دليل الألوان:</span>
          {[
            { c: 'bg-amber-600', t: 'INPUT / دخول' },
            { c: 'bg-emerald-600', t: 'OUTPUT / خروج' },
            { c: 'bg-red-600', t: '+V / موجب' },
            { c: 'bg-slate-700', t: 'GND / أرضي' },
            { c: 'bg-sky-600', t: 'SIGNAL / إشارة' },
          ].map((item) => (
            <span key={item.t} className="flex items-center gap-1 text-[9px] font-arabic font-bold text-neutral-700">
              <span className={`w-2.5 h-2.5 rounded-full ${item.c} ring-2 ring-white shadow`} />
              {item.t}
            </span>
          ))}
          <span className="ml-auto text-[8.5px] font-mono text-neutral-500">
            ×N = أسلاك متراكبة على نفس المنفذ
          </span>
        </div>

        {/* 3 Main Working Sections Grid */}
        <div className="grid grid-cols-12 gap-3.5">
          {/* SECTION 1: Capacitor and inductor banks */}
          <div className="col-span-4 flex flex-col gap-2.5 bg-[#f5f3eb] p-2.5 rounded-sm border border-[#c9c5b9] shadow-inner">
            {/* Capacitors & Inductor Bank */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-bold text-sky-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                CAPACITORS & INDUCTOR BANK (المكثفات والملف)
              </span>
              <div className="flex flex-col gap-1">
                {renderCapacitorItem('C1', '0.005 µF', 'C_005u:a', 'C_005u:b')}
                {renderCapacitorItem('C2', '0.2 µF', 'C_02u:a', 'C_02u:b')}
                {renderCapacitorItem('C3', '1.0 µF', 'C_1u:a', 'C_1u:b')}
                {renderCapacitorItem('C4', '47 µF (+)', 'C_47u:pos', 'C_47u:neg', true)}
                {renderCapacitorItem('C5', '470 µF (+)', 'C_470u:pos', 'C_470u:neg', true)}
                {renderCapacitorItem('C6', '1000 µF (+)', 'C_1000u:pos', 'C_1000u:neg', true)}
                {/* 5mH Choke Inductor */}
                <div className="flex items-center justify-between gap-1.5 p-1 bg-white/70 rounded-lg border border-neutral-300 shadow-sm">
                  {renderBananaSocket('L_5mH:a', 'red')}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-10 h-3 bg-amber-900/60 rounded-full border border-amber-950 flex items-center justify-center text-[7px] text-amber-200 font-bold">
                      ணணண
                    </div>
                    <span className="text-[9.5px] font-mono font-bold text-neutral-800 leading-tight mt-0.5">
                      5 mH CHOKE
                    </span>
                  </div>
                  {renderBananaSocket('L_5mH:b', 'black')}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 (Middle 4 cols): Semiconductor Devices & Op-Amps */}
          <div className="col-span-4 flex flex-col gap-2.5 bg-[#f5f3eb] p-2.5 rounded-sm border border-[#c9c5b9] shadow-inner">
            <span className="text-[10px] font-mono font-bold text-sky-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
              SEMICONDUCTORS & OP-AMPS (أشباه الموصلات)
            </span>

            {/* Diode 1N4007 */}
            <div className="p-2 bg-white/80 rounded-lg border border-neutral-300 flex items-center justify-between shadow-sm">
              <span className="text-[10px] font-mono font-bold text-neutral-800">1N4007 DIODE</span>
              <div className="flex items-center gap-2">
                {renderBananaSocket('D_1N4007:a', 'red', 'A', 'Anode (+)')}
                <div className="w-7 h-2 bg-neutral-900 rounded-sm relative flex items-center justify-end px-0.5">
                  <div className="w-1 h-full bg-slate-200" />
                </div>
                {renderBananaSocket('D_1N4007:k', 'black', 'K', 'Cathode (-)')}
              </div>
            </div>

            {/* Diode Bridge Rectifier (قنطرة دايود كاملة) */}
            <div className="p-2.5 bg-white/80 rounded-lg border border-neutral-300 shadow-sm flex flex-col items-center gap-1.5">
              <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-neutral-800 border-b border-neutral-200 pb-1">
                <span>BRIDGE RECTIFIER</span>
                <span className="text-sky-700">قنطرة التقويم</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full py-1">
                <div className="flex items-center justify-between bg-sky-50 p-1.5 rounded border border-sky-200">
                  <span className="text-[9px] font-mono font-bold text-sky-900">AC IN 1</span>
                  {renderBananaSocket('BR:ac1', 'yellow')}
                </div>
                <div className="flex items-center justify-between bg-sky-50 p-1.5 rounded border border-sky-200">
                  <span className="text-[9px] font-mono font-bold text-sky-900">AC IN 2</span>
                  {renderBananaSocket('BR:ac2', 'yellow')}
                </div>
                <div className="flex items-center justify-between bg-red-50 p-1.5 rounded border border-red-200">
                  <span className="text-[9px] font-mono font-bold text-red-700">(+) DC OUT</span>
                  {renderBananaSocket('BR:pos', 'red')}
                </div>
                <div className="flex items-center justify-between bg-neutral-100 p-1.5 rounded border border-neutral-300">
                  <span className="text-[9px] font-mono font-bold text-neutral-700">(-) DC OUT</span>
                  {renderBananaSocket('BR:neg', 'black')}
                </div>
              </div>
            </div>

            {/* Transistors Section (NPN & PNP) */}
            <div className="p-2.5 bg-white/80 rounded-lg border border-neutral-300 shadow-sm flex flex-col gap-2">
              {/* NPN 2N3904 */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-neutral-800">NPN 2N3904</span>
                  <span className="text-[8px] font-mono text-neutral-500">C - B - E</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderBananaSocket('Q_NPN:c', 'red', 'C')}
                  {renderBananaSocket('Q_NPN:b', 'blue', 'B')}
                  {renderBananaSocket('Q_NPN:e', 'black', 'E')}
                </div>
              </div>

              {/* PNP 2N3906 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-neutral-800">PNP 2N3906</span>
                  <span className="text-[8px] font-mono text-neutral-500">C - B - E</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderBananaSocket('Q_PNP:c', 'red', 'C')}
                  {renderBananaSocket('Q_PNP:b', 'blue', 'B')}
                  {renderBananaSocket('Q_PNP:e', 'black', 'E')}
                </div>
              </div>
            </div>

            {/* Operational Amplifier (LM741) */}
            <div className="p-2.5 bg-white/80 rounded-lg border border-neutral-300 shadow-sm flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-800 border-b border-neutral-200 pb-1">
                <span>OP-AMP LM741</span>
                <span className="text-purple-700">مكبر العمليات</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    {renderBananaSocket('OPAMP:in_n', 'yellow', 'IN-')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {renderBananaSocket('OPAMP:in_p', 'yellow', 'IN+')}
                  </div>
                </div>

                {/* Op-Amp Triangle Graphic */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-2 border-neutral-700 rounded-sm bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-[9px] shadow">
                    LM741
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {renderBananaSocket('OPAMP:vcc_p', 'red', 'V+')}
                    {renderBananaSocket('OPAMP:vcc_n', 'black', 'V-')}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  {renderBananaSocket('OPAMP:out', 'green', 'OUT')}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 (Right 4 cols): Resistors Bank & Potentiometer */}
          <div className="col-span-4 flex flex-col gap-2.5 bg-[#f5f3eb] p-2.5 rounded-sm border border-[#c9c5b9] shadow-inner">
            <span className="text-[10px] font-mono font-bold text-sky-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
              RESISTOR BANK (مصفوفة المقاومات)
            </span>

            {/* Resistors List */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-0">
              {renderResistorItem('R1', '100 Ω', 'R_100:a', 'R_100:b', ['#8B4513', '#000000', '#000000', '#000000', '#8B4513'])}
              {renderResistorItem('R2', '220 Ω', 'R_220:a', 'R_220:b', ['#ef4444', '#ef4444', '#000000', '#000000', '#8B4513'])}
              {renderResistorItem('R3', '470 Ω', 'R_470:a', 'R_470:b', ['#eab308', '#9333ea', '#000000', '#000000', '#8B4513'])}
              {renderResistorItem('R4', '1.0 kΩ', 'R_1k:a', 'R_1k:b', ['#8B4513', '#000000', '#000000', '#8B4513', '#8B4513'])}
              {renderResistorItem('R5', '2.2 kΩ', 'R_2k2:a', 'R_2k2:b', ['#ef4444', '#ef4444', '#000000', '#8B4513', '#8B4513'])}
              {renderResistorItem('R6', '4.7 kΩ', 'R_4k7:a', 'R_4k7:b', ['#eab308', '#9333ea', '#000000', '#8B4513', '#8B4513'])}
              {renderResistorItem('R7', '10.0 kΩ', 'R_10k:a', 'R_10k:b', ['#8B4513', '#000000', '#000000', '#ef4444', '#8B4513'])}
              {renderResistorItem('R8', '20.0 kΩ', 'R_20k:a', 'R_20k:b', ['#ef4444', '#000000', '#000000', '#ef4444', '#8B4513'])}
              {renderResistorItem('R9', '47.0 kΩ', 'R_47k:a', 'R_47k:b', ['#eab308', '#9333ea', '#000000', '#ef4444', '#8B4513'])}
              {renderResistorItem('R10', '100 kΩ', 'R_100k:a', 'R_100k:b', ['#8B4513', '#000000', '#000000', '#ea580c', '#8B4513'])}
              {renderResistorItem('R11', '1.0 MΩ', 'R_1M:a', 'R_1M:b', ['#8B4513', '#000000', '#000000', '#eab308', '#8B4513'])}
            </div>

            {/* Variable Potentiometer 10k */}
            <div className="p-2.5 bg-white/80 rounded-lg border border-neutral-300 shadow-sm flex flex-col gap-1.5 mt-auto">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-800">
                <span>10kΩ POTENTIOMETER</span>
                <span className="text-amber-700">
                  {Math.round((internalPot / 100) * 10000)} Ω ({(internalPot).toFixed(0)}%)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={internalPot}
                onChange={handlePotSlider}
                className="w-full accent-sky-600 h-1.5 cursor-pointer"
              />
              <div className="flex items-center justify-between px-2 pt-1 border-t border-neutral-200">
                {renderBananaSocket('POT_10k:1', 'red', 'Pin 1')}
                {renderBananaSocket('POT_10k:w', 'blue', 'Wiper')}
                {renderBananaSocket('POT_10k:3', 'black', 'Pin 3')}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: DC / AC Power Rails */}
        <div className="bg-slate-800 text-white p-2 rounded-xl flex items-center justify-between px-6 shadow-md border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-300">
              POWER & VOLTAGE BUS (خطوط التغذية والتأريض)
            </span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-red-400">+12V DC</span>
              {renderBananaSocket('PWR:p12v', 'red')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-sky-400">-12V DC</span>
              {renderBananaSocket('PWR:n12v', 'blue')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#244c7b]">+5V DC</span>
              {renderBananaSocket('PWR:p5v', 'yellow')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-neutral-400">GND / COM</span>
              {renderBananaSocket('PWR:gnd', 'black')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
