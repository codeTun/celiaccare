import { cn } from "@/lib/utils";

/*
 * Small decorative drawings shared by the home and about pages (Tunisian signature).
 * They are purely decorative: hidden from screen readers.
 */

/** The five petals of the jasmine flower of the logo, with its saffron heart. */
export function JasmineFlower({
  className,
  petalClassName = "fill-white",
  heartClassName = "fill-saffron-400",
}: {
  className?: string;
  petalClassName?: string;
  heartClassName?: string;
}) {
  return (
    <svg viewBox="-16 -16 32 32" className={cn("shrink-0", className)} aria-hidden="true" focusable="false">
      <g className={petalClassName}>
        {[0, 1, 2, 3, 4].map((petal) => (
          <path key={petal} d="M0 0C-5.4-2.4-6.6-10.6-.9-14 3.4-11.6 4.6-4.2 0 0Z" transform={`rotate(${petal * 72 - 8})`} />
        ))}
      </g>
      <circle r="2.6" className={heartClassName} />
    </svg>
  );
}

/** A short row of door studs, used as a divider between blocks of text. */
export function StudsDivider({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("studs mx-auto h-1.5 w-24", className)} />;
}

/** The door studs drawn along the inner arch and both sides of the doorway (see TunisianDoor). */
const ARCH = { x: 150, y: 150, radius: 118 };
const DOOR_STUDS: [number, number][] = [
  // around the arch, from the left side (180°) to the right side (0°)
  ...Array.from({ length: 11 }, (_, i): [number, number] => {
    const angle = Math.PI - (i * Math.PI) / 10;
    return [round(ARCH.x + ARCH.radius * Math.cos(angle)), round(ARCH.y - ARCH.radius * Math.sin(angle))];
  }),
  // down both sides
  ...Array.from({ length: 9 }, (_, i): [number, number] => [ARCH.x - ARCH.radius, 176 + i * 26]),
  ...Array.from({ length: 9 }, (_, i): [number, number] => [ARCH.x + ARCH.radius, 176 + i * 26]),
];

function round(value: number) {
  return Math.round(value * 10) / 10;
}

/**
 * Sidi Bou Saïd doorway in brand green: arch, studs, the line between the two door leaves
 * and a jasmine flower. Drawn for a 3:4 box (viewBox 300 x 400): give the parent `aspect-[3/4]`.
 * `idPrefix` must be different when the door is drawn twice on the same page.
 */
export function TunisianDoor({ className, idPrefix = "cc-door" }: { className?: string; idPrefix?: string }) {
  const gradientId = `${idPrefix}-gradient`;
  const patternId = `${idPrefix}-khatam`;
  return (
    <svg viewBox="0 0 300 400" className={cn("size-full", className)} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14915A" />
          <stop offset="1" stopColor="#0A5636" />
        </linearGradient>
        {/* zellige "khatam" star pattern, in white */}
        <pattern id={patternId} width="44" height="44" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#fff" strokeOpacity=".1">
            <path d="M13.5 13.5h17v17h-17z" />
            <path d="M22 10l12 12-12 12-12-12z" />
          </g>
        </pattern>
      </defs>
      {/* the door and its frame */}
      <path d="M0 400V150a150 150 0 0 1 300 0v250Z" fill={`url(#${gradientId})`} />
      <path d="M0 400V150a150 150 0 0 1 300 0v250Z" fill={`url(#${patternId})`} />
      <path d="M32 400V150a118 118 0 0 1 236 0v250" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="2" />
      {/* the two door leaves */}
      <path d="M150 400V262" stroke="#fff" strokeOpacity=".22" strokeWidth="2" />
      <g fill="#fff" fillOpacity=".55">
        {DOOR_STUDS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" />
        ))}
      </g>
      {/* door knockers */}
      <g fill="none" stroke="#F2B93B" strokeWidth="3">
        <circle cx="130" cy="300" r="7" />
        <circle cx="170" cy="300" r="7" />
      </g>
      {/* jasmine flower in the arch */}
      <g transform="translate(150 160) scale(3.6)">
        <g fill="#fff">
          {[0, 1, 2, 3, 4].map((petal) => (
            <path key={petal} d="M0 0C-5.4-2.4-6.6-10.6-.9-14 3.4-11.6 4.6-4.2 0 0Z" transform={`rotate(${petal * 72 - 8})`} />
          ))}
        </g>
        <circle r="2.6" fill="#F2B93B" />
      </g>
    </svg>
  );
}
