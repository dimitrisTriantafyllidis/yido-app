"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

export function QRCodeDisplay({ url, title }: { url: string; title: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: { dark: "#0F172A", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [url]);

  if (!qrDataUrl) return null;

  return (
    <div className="flex flex-col items-center">
      <img src={qrDataUrl} alt={`QR Code for ${title}`} className="w-32 h-32 rounded-[var(--radius-sm)]" />
      <a
        href={qrDataUrl}
        download={`qr-${title.toLowerCase().replace(/\s+/g, "-")}.png`}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] mt-2 font-medium cursor-pointer transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
      >
        <Download size={12} />
        Download QR
      </a>
    </div>
  );
}
