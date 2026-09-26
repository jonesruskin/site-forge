import { redirect } from "next/navigation";

import { AlbumGrid } from "@/components/gallery/album-grid";
import { PageHeader } from "@/components/sections/page-header";
import { galleryConfig, getAlbums } from "@/lib/gallery/gallery";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: galleryConfig.title,
  description: galleryConfig.description,
  path: "/gallery",
});

export default function GalleryPage() {
  const albums = getAlbums();
  // A single album needs no index.
  if (albums.length === 1) redirect(`/gallery/${albums[0]!.slug}`);
  return (
    <>
      <PageHeader title={galleryConfig.title} description={galleryConfig.description} />
      {albums.length === 0 ? (
        <p className="container-page text-muted-foreground pb-24">No albums yet.</p>
      ) : (
        <AlbumGrid albums={albums} />
      )}
    </>
  );
}
