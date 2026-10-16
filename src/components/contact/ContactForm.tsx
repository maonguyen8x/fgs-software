"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import { API_ROUTES } from "@/config/api-routes";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createContactSchema,
  type ContactFormData,
} from "@/lib/validation/contact-schema";
import { cn } from "@/lib/utils";

const defaultValues: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

interface CountryOption {
  code: CountryCode;
  name: string;
  callingCode: string;
}

export function ContactForm() {
  const t = useTranslations("contact");
  const tv = useTranslations("contact.validation");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<CountryCode>("JP");
  const [countries, setCountries] = useState<CountryOption[]>(() =>
    getCountries().map((code) => ({
      code,
      name: code,
      callingCode: getCountryCallingCode(code),
    }))
  );

  useEffect(() => {
    const names = new Intl.DisplayNames([locale], { type: "region" });
    setCountries(
      getCountries()
      .map((code) => ({
        code,
        name: names.of(code) ?? code,
        callingCode: getCountryCallingCode(code),
      }))
        .sort((a, b) => a.name.localeCompare(b.name, locale))
    );
  }, [locale]);

  const schema = useMemo(
    () =>
      createContactSchema({
        nameRequired: tv("name_required"),
        nameMin: tv("name_min"),
        phoneRequired: tv("phone_required"),
        emailRequired: tv("email_required"),
        emailInvalid: tv("email_invalid"),
        messageRequired: tv("message_required"),
        messageMin: tv("message_min"),
      }),
    [tv]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const inputClass = (field: keyof ContactFormData) =>
    cn(
      "mt-2 h-12 rounded-full border-slate-200 bg-white/80 px-5 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500/20",
      errors[field] && "border-red-500 focus-visible:ring-red-500"
    );

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.contact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: `+${getCountryCallingCode(country)} ${data.phone}`,
          message: data.message,
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        code?: string;
      } | null;
      if (!res.ok) {
        if (body?.code === "EMAIL_NOT_CONFIGURED" || body?.code === "EMAIL_SEND_FAILED") {
          toast.error(t("email_delivery_failed"));
        } else {
          toast.error(t("error"));
        }
        return;
      }
      toast.success(t("success"));
      reset(defaultValues);
    } catch {
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (fieldErrors: FieldErrors<ContactFormData>) => {
    const firstField = Object.keys(fieldErrors)[0];
    if (firstField) {
      const element = document.getElementById(firstField);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus();
    }
    toast.error(tv("form_invalid"));
  };

  const fieldError = (field: keyof ContactFormData) =>
    errors[field] ? (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
        {errors[field]?.message}
      </p>
    ) : null;

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <RequiredLabel htmlFor="firstName" required className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t("first_name")}
          </RequiredLabel>
          <Input
            id="firstName"
            autoComplete="given-name"
            placeholder={t("first_name_placeholder")}
            aria-invalid={!!errors.firstName}
            {...register("firstName")}
            className={inputClass("firstName")}
          />
          {fieldError("firstName")}
        </div>
        <div>
          <RequiredLabel htmlFor="lastName" required className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {t("last_name")}
          </RequiredLabel>
          <Input
            id="lastName"
            autoComplete="family-name"
            placeholder={t("last_name_placeholder")}
            aria-invalid={!!errors.lastName}
            {...register("lastName")}
            className={inputClass("lastName")}
          />
          {fieldError("lastName")}
        </div>
      </div>

      <div>
        <RequiredLabel htmlFor="email" required className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("work_email")}
        </RequiredLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("email_placeholder")}
          aria-invalid={!!errors.email}
          {...register("email")}
          className={inputClass("email")}
        />
        {fieldError("email")}
      </div>

      <div>
        <RequiredLabel htmlFor="phone" required className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("phone")}
        </RequiredLabel>
        <div className="mt-2 flex gap-2">
          <select
            aria-label={t("country_selector")}
            value={country}
            onChange={(event) => setCountry(event.target.value as CountryCode)}
            className="h-12 w-[42%] min-w-0 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:w-[38%]"
          >
            {countries.map(({ code, name, callingCode }) => (
              <option key={code} value={code}>
                {String.fromCodePoint(...[...code].map((letter) => letter.charCodeAt(0) + 127397))} {name} (+{callingCode})
              </option>
            ))}
          </select>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel-national"
            placeholder={t("phone_placeholder")}
            aria-invalid={!!errors.phone}
            {...register("phone")}
            className={cn(inputClass("phone"), "min-w-0 flex-1")}
          />
        </div>
        {fieldError("phone")}
      </div>

      <div>
        <RequiredLabel htmlFor="message" required className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("message")}
        </RequiredLabel>
        <Textarea
          id="message"
          rows={4}
          placeholder={t("message_placeholder")}
          aria-invalid={!!errors.message}
          {...register("message")}
          className={cn(
            "mt-2 min-h-32 rounded-3xl border-slate-200 bg-white/80 px-5 py-4 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500/20",
            errors.message && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {fieldError("message")}
      </div>

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-500">{t("reply_note")}</p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#101116] px-7 text-sm font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t("sending") : t("submit")}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
