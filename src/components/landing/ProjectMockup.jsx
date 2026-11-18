/** Small hand-built screens for the portfolio. They are drawings, so screen readers skip them. */

const line = 'rounded-full bg-white/15';
const box = 'rounded-md bg-white/[0.07]';

function DashboardScreen() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="grid grid-cols-3 gap-2">
        {['bg-live/60', 'bg-cyber/60', 'bg-white/30'].map((color) => (
          <div key={color} className={`${box} p-2`}>
            <div className={`h-1 w-2/3 rounded-full ${color}`} />
            <div className={`${line} mt-1.5 h-1.5 w-1/2`} />
          </div>
        ))}
      </div>
      <div className={`${box} relative min-h-0 flex-1 overflow-hidden`}>
        <svg viewBox="0 0 200 70" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d="M0 58 C24 46 36 52 58 38 S98 44 118 24 S166 30 200 8 V70 H0Z" fill="rgb(var(--live) / 0.14)" />
          <path d="M0 58 C24 46 36 52 58 38 S98 44 118 24 S166 30 200 8" fill="none" stroke="rgb(var(--live))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}

function CatalogScreen() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex gap-1.5">
        <div className="h-2.5 w-10 rounded-full bg-live/50" />
        <div className="h-2.5 w-12 rounded-full bg-white/10" />
        <div className="h-2.5 w-8 rounded-full bg-white/10" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-2">
        <div className="col-span-2 row-span-2 rounded-md bg-gradient-to-br from-cyber/30 to-white/5" />
        <div className="rounded-md bg-gradient-to-br from-live/25 to-white/5" />
        <div className="rounded-md bg-gradient-to-br from-cyber/20 to-white/5" />
      </div>
    </div>
  );
}

function LandingScreen() {
  return (
    <div className="flex h-full items-center gap-3 p-4">
      <div className="flex-1">
        <div className="h-2.5 w-11/12 rounded-full bg-white/50" />
        <div className="mt-1.5 h-2.5 w-2/3 rounded-full bg-gradient-to-r from-live to-cyber" />
        <div className={`${line} mt-3 h-1.5 w-full`} />
        <div className={`${line} mt-1 h-1.5 w-4/5`} />
        <div className="mt-3 h-3.5 w-14 rounded-md bg-gradient-to-r from-live to-cyber" />
      </div>
      <div className="aspect-square w-2/5 rounded-xl bg-gradient-to-br from-cyber/30 via-white/5 to-live/25 ring-1 ring-white/10" />
    </div>
  );
}

function ShopScreen() {
  return (
    <div className="grid h-full grid-cols-3 gap-2 p-3">
      {['from-live/30', 'from-cyber/30', 'from-white/20', 'from-cyber/20', 'from-white/15', 'from-live/20'].map((tone, index) => (
        <div key={index} className="flex min-h-0 flex-col gap-1">
          <div className={`min-h-0 flex-1 rounded-md bg-gradient-to-br ${tone} to-white/5`} />
          <div className={`${line} h-1 w-4/5`} />
          <div className="h-1 w-1/2 rounded-full bg-live/60" />
        </div>
      ))}
    </div>
  );
}

function TableScreen() {
  return (
    <div className="flex h-full gap-2 p-3">
      <div className={`${box} w-1/5`} />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className={`${box} flex flex-1 items-center gap-2 px-2`}>
            <div className={`size-1.5 rounded-full ${row % 2 ? 'bg-cyber' : 'bg-live'}`} />
            <div className={`${line} h-1 flex-1`} />
            <div className="h-1 w-1/5 rounded-full bg-white/25" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Racing-team site: start lights, a side-on F1 car, and standings, race and driver cards. */
const RACE_RED = '#e10600';

function RaceCar({ className = '' }) {
  return (
    <svg viewBox="0 0 200 56" className={className}>
      <g stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round">
        <path d="M0 24 H20 M4 32 H18 M0 40 H12" />
      </g>
      <rect x="8" y="10" width="20" height="4" rx="1" fill={RACE_RED} />
      <rect x="10" y="10" width="3" height="24" fill="#1a2440" />
      <path d="M16 40 L22 30 L54 28 L66 18 L80 15 L86 22 L100 23 L114 27 L152 30 L184 35 L196 40 L188 42 L22 42 Z" fill="#18213a" />
      <path d="M50 33 L112 30 L168 34 L186 38 L112 37 L50 38 Z" fill={RACE_RED} />
      <path d="M66 18 L80 15 L84 20 L70 22 Z" fill={RACE_RED} />
      <path d="M88 23 Q96 13 106 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <path d="M162 43 H198 V46 H158 Z" fill={RACE_RED} />
      <rect x="22" y="42" width="140" height="2.5" rx="1" fill="#0a0f1d" />
      {[
        [44, 41, 12],
        [152, 42, 11],
      ].map(([cx, cy, r]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r={r} fill="#06080f" stroke="#2b3550" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r={r / 3} fill="#3b4664" />
        </g>
      ))}
    </svg>
  );
}

function RacingScreen() {
  const panel = 'rounded-md bg-white/[0.05] ring-1 ring-white/[0.06]';

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-[#0d1530] via-[#070b18] to-[#04060c]">
      <div
        className="pointer-events-none absolute -right-1/4 -top-1/3 size-3/4 rounded-full opacity-40 blur-2xl"
        style={{ background: `radial-gradient(circle, ${RACE_RED}, transparent 65%)` }}
      />

      <div className="relative flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2.5 -skew-x-12" style={{ background: RACE_RED }} />
          <span className="h-1.5 w-8 rounded-full bg-white/70" />
        </div>
        <div className="flex items-center gap-1.5">
          {['w-4', 'w-5', 'w-4', 'w-5'].map((width, index) => (
            <span key={index} className={`h-1 ${width} rounded-full bg-white/20`} />
          ))}
          <span className="ml-1 h-2.5 w-7 rounded-full" style={{ background: RACE_RED }} />
        </div>
      </div>

      <div className="relative grid min-h-0 flex-1 grid-cols-[1fr_1.3fr] items-center gap-2 px-3">
        <div>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((light) => (
              <span key={light} className="size-1.5 rounded-full" style={{ background: RACE_RED, boxShadow: `0 0 4px ${RACE_RED}` }} />
            ))}
          </div>
          <div className="mt-2 h-2.5 w-full -skew-x-12 rounded-sm bg-white/85" />
          <div className="mt-1 h-2.5 w-4/5 -skew-x-12 rounded-sm" style={{ background: RACE_RED }} />
          <div className={`${line} mt-2.5 h-1 w-11/12`} />
          <div className={`${line} mt-1 h-1 w-3/4`} />
          <div className="mt-2.5 flex gap-1">
            <span className="h-3 w-10 -skew-x-12 rounded-sm" style={{ background: RACE_RED }} />
            <span className="h-3 w-9 -skew-x-12 rounded-sm ring-1 ring-white/30" />
          </div>
        </div>
        <RaceCar className="w-full drop-shadow-[0_6px_10px_rgba(225,6,0,0.25)]" />
      </div>

      <div className="relative grid grid-cols-3 gap-1.5 px-3 pb-2.5">
        <div className={`${panel} flex flex-col gap-1 p-1.5`}>
          {[RACE_RED, 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)'].map((tone, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="size-1.5 rounded-sm" style={{ background: tone }} />
              <span className={`${line} h-1 flex-1`} />
            </div>
          ))}
        </div>
        <div className={`${panel} p-1.5`}>
          <div className="h-1 w-2/3 rounded-full" style={{ background: RACE_RED }} />
          <div className="mt-1.5 grid grid-cols-3 gap-0.5">
            {[0, 1, 2].map((unit) => (
              <span key={unit} className="h-3 rounded-sm bg-white/10" />
            ))}
          </div>
        </div>
        <div className={`${panel} flex items-center gap-1.5 p-1.5`}>
          <div className="flex -space-x-1">
            {['from-white/60', 'from-[#e10600]', 'from-white/35'].map((tone) => (
              <span key={tone} className={`size-3.5 rounded-full bg-gradient-to-br ${tone} to-[#18213a] ring-1 ring-[#070b18]`} />
            ))}
          </div>
          <span className={`${line} h-1 flex-1`} />
        </div>
      </div>
    </div>
  );
}

const SCREENS = {
  dashboard: DashboardScreen,
  catalog: CatalogScreen,
  landing: LandingScreen,
  shop: ShopScreen,
  table: TableScreen,
  racing: RacingScreen,
};

export default function ProjectMockup({ kind, className = '' }) {
  const Screen = SCREENS[kind] ?? LandingScreen;

  return (
    <div aria-hidden className={`overflow-hidden rounded-xl bg-[#0d0f0e] ring-1 ring-white/10 ${className}`}>
      <div className="flex items-center gap-1 border-b border-white/10 px-2.5 py-1.5">
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="size-1.5 rounded-full bg-live/70" />
        <span className="ml-1.5 h-1.5 w-1/3 rounded-full bg-white/10" />
      </div>
      <div className="aspect-[16/9]">
        <Screen />
      </div>
    </div>
  );
}
