interface GoogleMapEmbedProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  embedUrl?: string;
  className?: string;
}

function hasValidCoordinates(latitude?: number, longitude?: number): boolean {
  return (
    latitude !== undefined &&
    longitude !== undefined &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export function buildGoogleMapEmbedSrc({
  latitude,
  longitude,
  address,
  embedUrl,
}: Pick<GoogleMapEmbedProps, "latitude" | "longitude" | "address" | "embedUrl">): string {
  if (hasValidCoordinates(latitude, longitude)) {
    return `https://maps.google.com/maps?q=${latitude},${longitude}&hl=vi&z=15&output=embed`;
  }

  const trimmedEmbed = embedUrl?.trim();
  if (trimmedEmbed) return trimmedEmbed;

  const trimmedAddress = address?.trim();
  if (trimmedAddress) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(trimmedAddress)}&hl=vi&z=15&output=embed`;
  }

  return "https://maps.google.com/maps?q=16.0544,108.2022&hl=vi&z=15&output=embed";
}

export function GoogleMapEmbed({
  latitude = 16.0544,
  longitude = 108.2022,
  address,
  embedUrl,
  className = "",
}: GoogleMapEmbedProps) {
  const src = buildGoogleMapEmbedSrc({ latitude, longitude, address, embedUrl });

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm dark:border-slate-700 ${className}`}
    >
      <iframe
        title="FGS Software location"
        src={src}
        className="h-full min-h-[320px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
