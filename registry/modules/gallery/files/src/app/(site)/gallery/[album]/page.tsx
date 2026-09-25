import { notFound } from "next/navigation";

import { PhotoGrid } from "@/components/gallery/photo-grid";
import { PageHeader } from "@/components/sections/page-header";
import { formatTakenAt, galleryConfig, getAlbum, getAlbums } from "@/lib/gallery/gallery";
import { createMetadata } from "@/lib/metadata";
import { JsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/url";

type Props = { params: Promise<{ album: string }> };

export function generateStaticParams() {
  return getAlbums().map((album) => ({ album: album.slug }));
}

export async function generateMetadata({ params }: Props) {
  const album = getAlbum((await params).album);
  if (!album) return {};
  const cover = album.cover ?? album.photos[0]!;
  return createMetadata({
    title: `${album.title} · ${galleryConfig.title}`,
    description: album.description ?? galleryConfig.description,
    path: `/gallery/${album.slug}`,
    image: cover.src.endsWith(".svg") ? undefined : cover.src,
  });
}

export default async function AlbumPage({ params }: Props) {
  const album = getAlbum((await params).album);
  if (!album) notFound();
  const several = getAlbums().length > 1;

  return (
    <>
      <JsonLd
        data={{
          "@type": "ImageGallery",
          name: album.title,
          ...(album.description && { description: album.description }),
          url: absoluteUrl(`/gallery/${album.slug}`),
          image: album.photos.map((photo) => ({
            "@type": "ImageObject",
            contentUrl: absoluteUrl(photo.src),
            description: photo.alt,
            ...(photo.caption && { name: photo.caption }),
            ...(photo.takenAt && { dateCreated: photo.takenAt }),
          })),
        }}
      />
      <PageHeader
        breadcrumbs={
          several
            ? [{ label: galleryConfig.title, href: "/gallery" }, { label: album.title }]
            : undefined
        }
        eyebrow={several ? undefined : galleryConfig.title}
        title={album.title}
        description={album.description}
      />
      <PhotoGrid
        albumTitle={album.title}
        photos={album.photos.map((photo) => ({
          ...photo,
          takenAtLabel: formatTakenAt(photo.takenAt),
        }))}
      />
    </>
  );
}
