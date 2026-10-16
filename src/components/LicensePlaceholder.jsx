// Visually loud placeholder for licensing / compliance info that must be
// filled in later with the distillery's verified licensing details.
// Bright yellow + pink so it's impossible to miss against the dark theme.
export default function LicensePlaceholder({ label = "TABC Distiller License #" }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-black font-label text-[10px] tracking-widest uppercase border-2 border-pink-600 rounded-sm"
      title="Placeholder — replace with actual licensing information before launch"
    >
      <span className="w-2 h-2 bg-pink-600 rounded-full animate-pulse" />
      {label} XXXX-XXXX-XXXX
    </span>
  );
}