import React from 'react';
import { Wire, Port } from '../types/lab';

interface WireOverlayProps {
  wires: Wire[];
  ports: Port[];
  wiringSourcePort: Port | null;
  mousePos: { x: number; y: number };
  activeColor: string;
  visible: boolean;
  selectedWireId?: string | null;
  onSelectWire?: (wireId: string) => void;
  onRemoveWire: (wireId: string) => void;
  onRemoveWiresAtPort?: (portId: string) => void;
  // Get coordinate of port element in workbench container coordinate space
  getPortCoord: (portId: string) => { x: number; y: number } | null;
}

/** Vertical distance between two banana plugs stacked on the same jack. */
const STACK_STEP = 7;
/** Extra 4mm plugs that can visibly tower above a single jack. */
const MAX_STACK_LEVELS = 12;

const COLOR_STYLES: Record<string, { stroke: string; boot: string; label: string }> = {
  red: { stroke: '#ef4444', boot: '#7f1d1d', label: 'Red' },
  black: { stroke: '#334155', boot: '#020617', label: 'Black' },
  blue: { stroke: '#0ea5e9', boot: '#075985', label: 'Blue' },
  green: { stroke: '#16a34a', boot: '#14532d', label: 'Green' },
  yellow: { stroke: '#eab308', boot: '#854d0e', label: 'Yellow' },
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const WireOverlay: React.FC<WireOverlayProps> = ({
  wires,
  ports,
  wiringSourcePort,
  mousePos,
  activeColor,
  visible,
  selectedWireId = null,
  onSelectWire,
  onRemoveWire,
  onRemoveWiresAtPort,
  getPortCoord,
}) => {
  if (!visible) return null;

  const portById = new Map(ports.map((p) => [p.id, p] as const));
  const coordCache = new Map<string, { x: number; y: number } | null>();
  const coordOf = (portId: string) => {
    if (!coordCache.has(portId)) coordCache.set(portId, getPortCoord(portId));
    return coordCache.get(portId) ?? null;
  };

  // Build the plug stack of each jack in insertion order: the first wire sits
  // directly in the socket, every extra wire (parallel branch, meter tap,
  // second probe...) is stacked one level above it.
  const stackByPort = new Map<string, string[]>();
  for (const wire of wires) {
    for (const portId of [wire.fromPortId, wire.toPortId]) {
      const list = stackByPort.get(portId);
      if (list) list.push(wire.id);
      else stackByPort.set(portId, [wire.id]);
    }
  }

  const levelOf = (portId: string, wireId: string) => {
    const list = stackByPort.get(portId);
    if (!list) return 0;
    const idx = list.indexOf(wireId);
    return idx < 0 ? 0 : idx;
  };

  const stackCount = (portId: string) => stackByPort.get(portId)?.length ?? 0;

  const endpoint = (portId: string, wireId: string) => {
    const base = coordOf(portId);
    if (!base) return null;
    const level = levelOf(portId, wireId);
    const visualLevel = Math.min(level, MAX_STACK_LEVELS - 1);
    return { base, x: base.x, y: base.y - visualLevel * STACK_STEP, level };
  };

  const buildPath = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    level: number,
    total: number
  ) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    // Cable sag grows with free length, like a real silicone test lead.
    const sag = Math.min(150, Math.max(24, dist * 0.22));
    // Separate parallel runs so three leads on one jack never draw as one blob.
    const bow = (level - (total - 1) / 2) * 7;
    const nx = -dy / dist;
    const ny = dx / dist;
    const qx = (a.x + b.x) / 2 + nx * bow;
    const qy = (a.y + b.y) / 2 + sag + ny * bow;
    return { d: `M ${a.x} ${a.y} Q ${qx} ${qy} ${b.x} ${b.y}`, qx, qy };
  };

  const quadPoint = (a: { x: number; y: number }, q: { x: number; y: number }, b: { x: number; y: number }, t: number) => {
    const mt = 1 - t;
    return {
      x: mt * mt * a.x + 2 * mt * t * q.x + t * t * b.x,
      y: mt * mt * a.y + 2 * mt * t * q.y + t * t * b.y,
    };
  };

  return (
    <svg
      className="absolute left-0 top-0 pointer-events-none overflow-visible z-30"
      width={12000}
      height={9000}
      viewBox="0 0 12000 9000"
      preserveAspectRatio="none"
      aria-label="Workbench wire connections"
    >
      <defs>
        <filter id="wire-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
        </filter>
        <filter id="wire-selected-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#22d3ee" floodOpacity="0.85" />
        </filter>
      </defs>

      {wires.map((wire) => {
        const p1 = endpoint(wire.fromPortId, wire.id);
        const p2 = endpoint(wire.toPortId, wire.id);
        if (!p1 || !p2) return null;

        const styling = COLOR_STYLES[wire.color] || COLOR_STYLES.red;
        const isBnc = wire.type === 'bnc';
        const wireWidth = isBnc ? 6 : 4.6;
        const a = { x: p1.x, y: p1.y };
        const b = { x: p2.x, y: p2.y };
        const levels = stackCount(wire.fromPortId) + stackCount(wire.toPortId);
        const { d, qx, qy } = buildPath(a, b, Math.max(p1.level, p2.level), Math.max(2, levels / 2));
        const mid = quadPoint(a, { x: qx, y: qy }, b, 0.5);
        const isSelected = selectedWireId === wire.id;
        const fromName = portById.get(wire.fromPortId)?.name ?? wire.fromPortId;
        const toName = portById.get(wire.toPortId)?.name ?? wire.toPortId;

        return (
          <g key={wire.id} className="pointer-events-auto group">
            <title>
              {`${styling.label} • ${fromName} → ${toName}\nاضغط للتحديد ثم زر الحذف أو Delete، ودبل كلك للحذف الفوري`}
            </title>

            {/* Wide invisible hit area */}
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectWire?.(wire.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onRemoveWire(wire.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemoveWire(wire.id);
              }}
            />

            {/* Selection halo */}
            {(isSelected || wire.id === selectedWireId) && (
              <path
                d={d}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={wireWidth + 9}
                strokeLinecap="round"
                opacity={0.45}
                filter="url(#wire-selected-glow)"
              />
            )}

            <path
              d={d}
              fill="none"
              stroke={styling.boot}
              strokeWidth={wireWidth + 2.4}
              opacity={0.45}
              filter="url(#wire-shadow)"
            />
            <path
              d={d}
              fill="none"
              stroke={styling.stroke}
              strokeWidth={wireWidth}
              strokeLinecap="round"
              className="group-hover:brightness-125 transition-[filter] duration-150"
            />
            <path
              d={d}
              fill="none"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth={Math.max(1, wireWidth * 0.28)}
              strokeLinecap="round"
            />

            {/* Plug boots at the (possibly stacked) endpoints */}
            {[p1, p2].map((end, i) => (
              <g key={i}>
                <circle cx={end.x} cy={end.y} r={wireWidth + 2.8} fill="#070b12" stroke={styling.boot} strokeWidth="1.2" />
                <circle cx={end.x} cy={end.y} r={wireWidth} fill={styling.stroke} />
                <circle cx={end.x} cy={end.y} r={1.6} fill="#facc15" />
              </g>
            ))}

            {/* Delete badge at the middle of the cable */}
            <g
              transform={`translate(${mid.x}, ${mid.y})`}
              className={`transition-opacity cursor-pointer ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveWire(wire.id);
              }}
            >
              <circle cx="0" cy="0" r="11" fill="#dc2626" stroke="#ffffff" strokeWidth="1.8" />
              <line x1="-4" y1="-4" x2="4" y2="4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="4" y1="-4" x2="-4" y2="4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <title>فك هذا السلك</title>
            </g>
          </g>
        );
      })}

      {/* Stacked-plug towers + "unplug all" counters on shared jacks */}
      {Array.from(stackByPort.entries()).map(([portId, list]) => {
        if (list.length < 2) return null;
        const base = coordOf(portId);
        if (!base) return null;
        const levels = Math.min(list.length, MAX_STACK_LEVELS);
        const topY = base.y - (levels - 1) * STACK_STEP;
        const port = portById.get(portId);
        return (
          <g key={`stack-${portId}`}>
            <line
              x1={base.x}
              y1={base.y}
              x2={base.x}
              y2={topY}
              stroke="#0b1220"
              strokeWidth={9}
              strokeLinecap="round"
              opacity={0.85}
            />
            <line
              x1={base.x}
              y1={base.y}
              x2={base.x}
              y2={topY}
              stroke="#334155"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <g
              transform={`translate(${base.x + 15}, ${topY - 9})`}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveWiresAtPort?.(portId);
              }}
            >
              <title>{`${port?.name ?? portId}\n${list.length} أسلاك متراكبة — اضغط لفكها كلها`}</title>
              <rect x="-13" y="-9" width="26" height="18" rx="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
              <text x="0" y="4" fill="#7dd3fc" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                ×{list.length}
              </text>
            </g>
          </g>
        );
      })}

      {/* Rubber-band wire preview following cursor while wiring */}
      {wiringSourcePort &&
        (() => {
          const p1 = coordOf(wiringSourcePort.id);
          if (!p1) return null;
          const styling = COLOR_STYLES[activeColor] || COLOR_STYLES.red;
          const { d } = buildPath(p1, mousePos, 0, 1);
          return (
            <g>
              <path
                d={d}
                fill="none"
                stroke={styling.stroke}
                strokeWidth={4.5}
                strokeDasharray="7 5"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <circle cx={p1.x} cy={p1.y} r="6" fill={styling.stroke} />
              <circle cx={mousePos.x} cy={mousePos.y} r="6" fill={styling.stroke} opacity={0.85} />
              <circle
                cx={mousePos.x}
                cy={mousePos.y}
                r="12"
                fill="none"
                stroke={styling.stroke}
                strokeWidth="1.5"
                opacity={clamp(0.8, 0, 1)}
              />
            </g>
          );
        })()}
    </svg>
  );
};
