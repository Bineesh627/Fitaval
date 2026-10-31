import React, { useMemo } from "react";
import { BarcodeFormat, EncodeHintType, QRCodeWriter } from "@zxing/library";

/** QR code rendered as a crisp black-on-white SVG (uses the already-installed ZXing encoder). */
export default function QrCodeSvg({ value, size = 176, margin = 2, className = "" }) {
  const path = useMemo(() => {
    if (!value) return null;
    try {
      const hints = new Map([[EncodeHintType.MARGIN, margin]]);
      const m = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, 0, 0, hints);
      const n = m.getWidth();
      let d = "";
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          if (m.get(x, y)) d += `M${x} ${y}h1v1h-1z`;
        }
      }
      return { d, n };
    } catch (e) {
      console.error("QR render failed", e);
      return null;
    }
  }, [value, margin]);

  if (!path) return null;
  return (
    <svg
      viewBox={`0 0 ${path.n} ${path.n}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={`QR code ${value}`}
    >
      <rect width={path.n} height={path.n} fill="#fff" />
      <path d={path.d} fill="#000" />
    </svg>
  );
}
