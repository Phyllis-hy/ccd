// src/components/Team/TeamCard.tsx
import Image from "next/image";

interface TeamCardProps {
  name: string;
  role: string;
  image: string; // 👈 Added
}

export default function TeamCard({ name, role, image }: TeamCardProps) {
  return (
    <div className="h-full rounded-2xl border border-black/10 bg-white p-6 flex items-center gap-4">
      {/* Avatar */}
      <div className="relative h-14 w-14 rounded-full overflow-hidden bg-neutral-200">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* Text */}
      <div>
        <p className="font-medium text-neutral-900">{name}</p>
        <p className="text-sm text-neutral-600">{role}</p>
      </div>
    </div>
  );
}
