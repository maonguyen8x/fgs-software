import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContentBlock } from "@/components/ui/ContentBlock";
import { GoogleMapEmbed } from "@/components/contact/GoogleMapEmbed";
import { getCachedBranches } from "@/lib/cache/queries";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import type { Locale } from "@/i18n/routing";

export const revalidate = 300;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const loc = locale as Locale;
  const [settings, branches, blocks] = await Promise.all([
    getSettingsMapSafe(),
    getCachedBranches(),
    fetchPageBlockMap("contact"),
  ]);
  const headerTitle = getPageBlockTitle(blocks, "page_header", loc, t("title"));
  const headerSubtitle = getPageBlockSubtitle(blocks, "page_header", loc, t("subtitle"));
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
    <div className="bg-linear-to-b from-amber-50/45 via-white to-rose-50/35">
      <PageHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        variant="contact"
        density="compact"
        backgroundColor={settings.page_header_contact_bg}
      />

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
