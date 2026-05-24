import { getTranslations } from "next-intl/server";
import { ErrorPage } from "@/components/errors/ErrorPage";

export default async function LocaleNotFound() {
  const t = await getTranslations("errors");

  return (
    <ErrorPage
      title={t("not_found_title")}
      description={t("not_found_description")}
      statusCode={404}
      statusLabel={t("status_404")}
      retryLabel={t("retry")}
      homeLabel={t("back_home")}
      homeHref="/vi"
      variant="generic"
    />
  );
}
