"use client";

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import type { Photo } from "@/lib/gallery/gallery";

type PhotoGridProps = {
  photos: (Photo & { takenAtLabel?: string })[];
  albumTitle: string;
};

const hashFor = (index: number) => `#photo-${index + 1}`;

/**
 * Masonry columns of photos. Opening one shows a lightbox (a native <dialog>):
 * arrow keys or swipes move between photos, Escape closes, and the URL hash
 * (#photo-3) makes any photo linkable.
 */
export function PhotoGrid({ photos, albumTitle }: PhotoGridProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const pointerStart = useRef<number | null>(null);

  const show = (next: number) => {
    const wrapped = (next + photos.length) % photos.length;
    setIndex(wrapped);
    history.replaceState(null, "", hashFor(wrapped));
    if (!dialog.current?.open) dialog.current?.showModal();
  };

  const close = () => dialog.current?.close();

  const onClose = () => {
    setIndex(null);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  // Deep link: /gallery/coastlines#photo-3 opens the third photo.
  const openFromHash = useEffectEvent(() => {
    const match = /^#photo-(\d+)$/.exec(window.location.hash);
    const target = match ? Number(match[1]) - 1 : -1;
    if (target >= 0 && target < photos.length) show(target);
  });
  useEffect(() => {
    // After paint, so the grid renders first and the dialog opens over it.
    const frame = requestAnimationFrame(() => openFromHash());
    const onHashChange = () => openFromHash();
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (index === null) return;
    if (event.key === "ArrowRight") show(index + 1);
    else if (event.key === "ArrowLeft") show(index - 1);
    else if (event.key === "Home") show(0);
    else if (event.key === "End") show(photos.length - 1);
    else return;
    event.preventDefault();
  };

  const onPointerDown = (event: PointerEvent) => {
    pointerStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (pointerStart.current === null || index === null) return;
    const delta = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(delta) > 50) show(delta < 0 ? index + 1 : index - 1);
  };

  const current = index === null ? null : photos[index]!;
  const neighbours =
    index === null
      ? []
      : [
          photos[(index + 1) % photos.length]!,
          photos[(index - 1 + photos.length) % photos.length]!,
        ];

  return (
    <>
      <ul className="container-page columns-1 gap-4 pb-24 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {photos.map((photo, photoIndex) => (
          <li key={photo.src} className="break-inside-avoid">
            <figure>
              <button
                type="button"
                onClick={() => show(photoIndex)}
                className="bg-muted focus-visible:ring-ring group block w-full overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label={`Open photo ${photoIndex + 1} of ${photos.length}: ${photo.alt}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
                />
              </button>
              {photo.caption && (
                <figcaption className="text-muted-foreground mt-2 text-sm">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={onClose}
        onKeyDown={onKeyDown}
        aria-label={`${albumTitle} photo viewer`}
        className="bg-background text-foreground m-0 h-dvh max-h-none w-screen max-w-none p-0 backdrop:bg-transparent"
      >
        {current && index !== null && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="text-muted-foreground font-mono text-xs" aria-live="polite">
                {index + 1} / {photos.length}
              </p>
              <button
                type="button"
                onClick={close}
                className="hover:bg-accent inline-flex size-10 items-center justify-center rounded-md"
                aria-label="Close"
              >
                <XIcon aria-hidden className="size-5" />
              </button>
            </div>
            <div
              className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-4 select-none sm:px-16"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
            >
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="100vw"
                priority
                draggable={false}
                className="animate-in max-h-full w-auto max-w-full object-contain"
              />
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => show(index - 1)}
                    className="bg-background/80 hover:bg-accent absolute left-2 hidden size-11 items-center justify-center rounded-full border sm:inline-flex"
                    aria-label="Previous photo"
                  >
                    <ChevronLeftIcon aria-hidden className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => show(index + 1)}
                    className="bg-background/80 hover:bg-accent absolute right-2 hidden size-11 items-center justify-center rounded-full border sm:inline-flex"
                    aria-label="Next photo"
                  >
                    <ChevronRightIcon aria-hidden className="size-5" />
                  </button>
                </>
              )}
            </div>
            <div className="min-h-16 px-4 py-4 text-center">
              {current.caption && <p className="font-medium">{current.caption}</p>}
              {(current.location || current.takenAtLabel) && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {[current.location, current.takenAtLabel].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            {/* Warm the cache for the neighbours so arrowing feels instant. */}
            <div hidden>
              {neighbours.map((photo) => (
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  sizes="100vw"
                />
              ))}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
