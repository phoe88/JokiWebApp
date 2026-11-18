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

const SCREENS = {
  dashboard: DashboardScreen,
  catalog: CatalogScreen,
  landing: LandingScreen,
  shop: ShopScreen,
  table: TableScreen,
};

/**
 * `image` (src, srcSet) shows a real preview picture, without the browser bar, in
 * place of a drawn screen. It is decorative, since the card title names the project.
 */
export default function ProjectMockup({ kind, image, sizes = '(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 92vw', className = '' }) {
  const Screen = SCREENS[kind] ?? LandingScreen;

  return (
    <div aria-hidden className={`overflow-hidden rounded-xl bg-[#0d0f0e] ring-1 ring-white/10 ${className}`}>
      {!image && (
        <div className="flex items-center gap-1 border-b border-white/10 px-2.5 py-1.5">
          <span className="size-1.5 rounded-full bg-white/25" />
          <span className="size-1.5 rounded-full bg-white/25" />
          <span className="size-1.5 rounded-full bg-live/70" />
          <span className="ml-1.5 h-1.5 w-1/3 rounded-full bg-white/10" />
        </div>
      )}
      <div className="aspect-[16/9]">
        {image ? (
          <img
            src={image.src}
            srcSet={image.srcSet}
            sizes={sizes}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <Screen />
        )}
      </div>
    </div>
  );
}
