import { ErrorPage } from "@/components/errors/ErrorPage";
import { loadMessages, resolveLocaleFromCookies } from "@/lib/i18n/resolve-locale";
import { notFound } from "next/navigation";

type ErrorCode = "400" | "401" | "403" | "404" | "500" | "503";

const ERROR_KEYS: Record<
  ErrorCode,
  { title: string; description: string; hint?: string; variant?: "server" | "network" | "generic" }
> = {
  "400": {
    title: "bad_request_title",
    description: "bad_request_description",
    variant: "generic",
  },
  "401": {
    title: "unauthorized_title",
    description: "unauthorized_description",
    variant: "generic",
  },
  "403": {
    title: "unauthorized_title",
    description: "unauthorized_description",
    variant: "generic",
  },
  "404": {
    title: "not_found_title",
    description: "not_found_description",
    variant: "generic",
  },
  "500": {
    title: "server_title",
    description: "server_description",
    hint: "server_hint",
    variant: "server",
  },
  "503": {
    title: "network_title",
    description: "network_description",
    variant: "network",
  },
};

export default async function ErrorUiPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const meta = ERROR_KEYS[code as ErrorCode];
  if (!meta) notFound();

  const locale = await resolveLocaleFromCookies();
  const messages = await loadMessages(locale);
  const errors = messages.errors as Record<string, string>;

  return (
    <ErrorPage
      title={errors[meta.title] ?? errors.server_title}
      description={errors[meta.description] ?? errors.server_description}
      hint={meta.hint ? errors[meta.hint] : undefined}
      statusCode={Number(code)}
      statusLabel={errors[`status_${code}`] ?? errors.server_status_label}
      retryLabel={errors.retry}
      homeLabel={errors.back_home}
      variant={meta.variant}
      homeHref={`/${locale}`}
    />
  );
}
