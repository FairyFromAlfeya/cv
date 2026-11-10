import Image from "next/image";

export function SectionBackground({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="section-background pointer-events-none absolute inset-0">
      <Image
        src={src}
        alt={alt}
        fill
        preload={src === "/assets/hero.png"}
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
