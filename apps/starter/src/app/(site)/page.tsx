import siteConfig from "@/site.config";

export default function HomePage() {
  return (
    <section className="container-page flex min-h-[60dvh] flex-col justify-center py-24">
      <h1 className="max-w-3xl text-display">{siteConfig.name}</h1>
      <p className="mt-6 max-w-2xl text-lead text-muted-foreground">{siteConfig.description}</p>
    </section>
  );
}
