// src/components/Avatar.tsx
type Props = { name?: string; size?: number };

function colorFromName(name: string) {
  // tiny color hash so different users get different pastel colors
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 85% 85%)`;
}

export default function Avatar({ name = "U", size = 32 }: Props) {
  const letter = (name || "U").trim().charAt(0).toUpperCase();
  const bg = colorFromName(name);
  const style: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: bg,
  };
  return (
    <div
      className="rounded-full flex items-center justify-center text-slate-700 font-semibold"
      style={style}
      title={name}
    >
      {letter}
    </div>
  );
}
