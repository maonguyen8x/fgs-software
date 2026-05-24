import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContentBlock } from "@/components/ui/ContentBlock";
import { GoogleMapEmbed } from "@/components/contact/GoogleMapEmbed";
import { getCachedBranches } from "@/lib/cache/queries";
import { getSettingsMapSafe } from "@/lib/settings-safe";

export const revalidate = 300;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const settings = await getSettingsMapSafe();
  const branches = await getCachedBranches();
  const hq = branches.find((b) => b.isHeadquarters) ?? branches[0];

  const address =
    settings.map_address?.trim() ||
    settings.address?.trim() ||
    hq?.address ||
    hq?.addressVi ||
    "";
  const lat = parseFloat(settings.map_latitude ?? "") || hq?.latitude || 16.0544;
  const lng = parseFloat(settings.map_longitude ?? "") || hq?.longitude || 108.2022;
  const embedUrl = settings.google_maps_embed_url;

  return (
    <div>
      <section className="page-hero section-padding-compact">
        <div className="container-narrow text-center">
          <h1 className="page-title text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <p className="page-subtitle mt-3 text-base md:text-lg">{t("subtitle")}</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container-narrow grid gap-6 lg:grid-cols-2">
          <GoogleMapEmbed
            address={address}
            latitude={lat}
            longitude={lng}
            embedUrl={embedUrl}
            className="h-full"
          />
          <ContentBlock>
            <h2 className="mb-3 text-lg font-semibold text-heading">{t("form_title")}</h2>
            <ContactForm />
          </ContentBlock>
        </div>
      </section>
    </div>
  );
}
