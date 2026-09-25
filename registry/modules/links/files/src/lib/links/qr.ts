import { encode } from "uqr";

/**
 * QR code as an SVG string drawn in `currentColor`, so it follows the theme on
 * screen and prints black on paper. One path, crisp at any size.
 */
export function qrSvg(text: string, { title = "QR code", border = 2 } = {}) {
  const { data, size } = encode(text, { ecc: "M", border });
  let path = "";
  data.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    });
  });
  const escaped = title.replace(/[<>&"]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="${escaped}"><title>${escaped}</title><path fill="currentColor" d="${path}"/></svg>`;
}
