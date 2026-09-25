import Image from "next/image";
import Link from "next/link";

import { formatTakenAt, type Album } from "@/lib/gallery/gallery";

export function AlbumGrid({ albums }: { albums: Album[] }) {
  return (
    <ul className="container-page grid gap-x-6 gap-y-10 pb-24 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((album) => {
        const cover = album.cover ?? album.photos[0]!;
        return (
          <li key={album.slug}>
            <Link href={`/gallery/${album.slug}`} className="group flex flex-col gap-3">
              <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-xl border">
                <Image
                  src={cover.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-semibold underline-offset-4 group-hover:underline">
                  {album.title}
                </h2>
                <p className="text-muted-foreground shrink-0 text-sm">
                  {album.photos.length} {album.photos.length === 1 ? "photo" : "photos"}
                  {album.date && ` · ${formatTakenAt(album.date)}`}
                </p>
              </div>
              {album.description && (
                <p className="text-muted-foreground -mt-1 text-sm">{album.description}</p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
