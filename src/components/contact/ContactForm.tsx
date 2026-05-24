"use client";

import { useMemo, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { API_ROUTES } from "@/config/api-routes";
import { Button } from "@/components/ui/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createContactSchema,
  type ContactFormData,
} from "@/lib/validation/contact-schema";
import { cn } from "@/lib/utils";

const defaultValues: ContactFormData = {
  name: "",
  email: "",
  company: "",
  phone: "",
  projectType: "",
  budget: "",
  message: "",
};

export function ContactForm() {
  const t = useTranslations("contact");
  const tv = useTranslations("contact.validation");
  const [loading, setLoading] = useState(false);

  const schema = useMemo(
    () =>
      createContactSchema({
        nameRequired: tv("name_required"),
        nameMin: tv("name_min"),
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
    setValue,
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
    cn("mt-1", errors[field] && "border-red-500 focus-visible:ring-red-500");

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.contact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("success"));
      reset(defaultValues);
    } catch {
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (fieldErrors: FieldErrors<ContactFormData>) => {
    const firstField = (Object.keys(fieldErrors)[0] ?? null) as keyof ContactFormData | null;
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
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
      <div>
        <RequiredLabel htmlFor="name" required>
          {t("name")}
        </RequiredLabel>
        <Input
          id="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
          className={inputClass("name")}
        />
        <span id="name-error">{fieldError("name")}</span>
      </div>
      <div>
        <RequiredLabel htmlFor="email" required>
          {t("email")}
        </RequiredLabel>
        <Input
          id="email"
          type="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
          className={inputClass("email")}
        />
        <span id="email-error">{fieldError("email")}</span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="company">{t("company")}</Label>
          <Input id="company" {...register("company")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" type="tel" {...register("phone")} className="mt-1" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>{t("project_type")}</Label>
          <Select onValueChange={(value) => setValue("projectType", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">{t("project_types.web")}</SelectItem>
              <SelectItem value="mobile">{t("project_types.mobile")}</SelectItem>
              <SelectItem value="api">{t("project_types.api")}</SelectItem>
              <SelectItem value="consulting">{t("project_types.consulting")}</SelectItem>
              <SelectItem value="other">{t("project_types.other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("budget")}</Label>
          <Select onValueChange={(value) => setValue("budget", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under5k">{t("budgets.under5k")}</SelectItem>
              <SelectItem value="5k15k">{t("budgets.5k15k")}</SelectItem>
              <SelectItem value="15k50k">{t("budgets.15k50k")}</SelectItem>
              <SelectItem value="over50k">{t("budgets.over50k")}</SelectItem>
              <SelectItem value="undecided">{t("budgets.undecided")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <RequiredLabel htmlFor="message" required>
          {t("message")}
        </RequiredLabel>
        <Textarea
          id="message"
          rows={6}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
          className={inputClass("message")}
        />
        <span id="message-error">{fieldError("message")}</span>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full cursor-pointer md:w-auto"
      >
        {loading ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
