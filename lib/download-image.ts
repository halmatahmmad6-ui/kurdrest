/**
 * Forces a real download of an image instead of just navigating to it.
 * Works for same-origin files (e.g. our own /uploads/*) via fetch + blob.
 * Falls back to opening the URL in a new tab for cross-origin images the
 * browser won't let us fetch (e.g. the seeded Unsplash demo photos), since
 * those can't be downloaded without a server-side proxy.
 */
export async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function pinFilename(imageUrl: string, title: string) {
  const ext = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
  const safeTitle = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "pin";
  return `${safeTitle}.${ext}`;
}
