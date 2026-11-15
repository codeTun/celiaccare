"use client";

import { ShieldBan, ShieldCheck } from "lucide-react";
import { useActionState, useState } from "react";

import { FormActions, FormGrid, FormMessage } from "@/components/admin/admin-form";
import { DateField } from "@/components/admin/date-field";
import { FormSection } from "@/components/admin/form-section";
import { Field, fieldA11y, Input, TextareaField, TextField } from "@/components/ui/form";
import { formatPhone } from "@/lib/format";
import { MAX_ORDERS_PER_DAY } from "@/lib/tunisia";
import { cn } from "@/lib/utils";
import { idleState, type ActionState } from "@/lib/validators";
import type { PhoneRuleType } from "@/types";
import type { AdminPhoneRuleRow } from "@/types/admin-data";

import { RULES_PATH } from "./clients-routes";

const TYPE_CHOICES: { value: PhoneRuleType; title: string; description: string; icon: typeof ShieldBan }[] = [
  {
    value: "BLOCKED",
    title: "Bloquer ce numéro",
    description: "Toutes ses commandes sont refusées (numéro abusif, commandes fictives…).",
    icon: ShieldBan,
  },
  {
    value: "EXCEPTION",
    title: "Autoriser une exception",
    description: `Plus de ${MAX_ORDERS_PER_DAY} commandes par jour pour un besoin justifié (crèche, entreprise…).`,
    icon: ShieldCheck,
  },
];

/**
 * Create or edit a phone rule (spec EF-39): block a number, or allow more orders per day.
 * When editing, the number cannot change (delete the rule and create another one instead).
 *
 * @example
 * <PhoneRuleForm action={createPhoneRuleAction} defaultPhone="20123456" defaultType="BLOCKED" minDate="2026-11-15" />
 * <PhoneRuleForm action={updatePhoneRuleAction.bind(null, rule.id)} rule={rule} minDate={today} />
 */
export function PhoneRuleForm({
  action,
  rule,
  defaultPhone,
  defaultType = "BLOCKED",
  minDate,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  /** The rule being edited (absent when creating). */
  rule?: AdminPhoneRuleRow;
  /** Pre-filled number when coming from a customer or a refused attempt. */
  defaultPhone?: string;
  defaultType?: PhoneRuleType;
  /** Today in Tunis ("YYYY-MM-DD"): an end date cannot be in the past. */
  minDate: string;
}) {
  const [state, formAction] = useActionState(action, idleState);
  const values = state.values;
  const errors = state.fieldErrors;
  const initialType = (values?.type as PhoneRuleType | undefined) ?? rule?.type ?? defaultType;
  // Shows the "orders per day" field only for an exception.
  const [type, setType] = useState<PhoneRuleType>(initialType);
  const maxError = errors?.maxPerDay;

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />
      <FormSection
        title="Numéro et règle"
        description={`Par défaut, un numéro peut passer ${MAX_ORDERS_PER_DAY} commandes par jour (EF-35). Une règle change cela pour un seul numéro.`}
      >
        <div className="space-y-5">
          {rule ? (
            <div>
              <p className="text-sm font-semibold text-ink">Numéro</p>
              <p dir="ltr" className="mt-1 text-start text-lg font-bold text-ink tabular">
                {formatPhone(rule.phone)}
              </p>
              <p className="text-xs text-ink-subtle">Pour une règle sur un autre numéro, créez-en une nouvelle.</p>
            </div>
          ) : (
            <TextField
              name="phone"
              type="tel"
              label="Numéro de téléphone"
              required
              maxLength={20}
              autoComplete="off"
              placeholder="20 123 456"
              defaultValue={values?.phone ?? (defaultPhone ? formatPhone(defaultPhone) : "")}
              hint="Numéro tunisien à 8 chiffres. S'il a déjà une règle, elle sera remplacée."
              error={errors?.phone}
              wrapperClassName="sm:max-w-xs"
            />
          )}

          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Type de règle<span className="ms-0.5 text-red-600" aria-hidden="true">*</span>
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {TYPE_CHOICES.map((choice) => {
                const Icon = choice.icon;
                const checked = type === choice.value;
                return (
                  <label
                    key={choice.value}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-2xl border bg-white p-4 transition-colors",
                      checked ? "border-brand-500 ring-2 ring-brand-100" : "border-line hover:border-brand-200",
                    )}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={choice.value}
                      checked={checked}
                      onChange={() => setType(choice.value)}
                      className="mt-1 size-4 shrink-0 accent-brand-600"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                        <Icon
                          className={cn("size-4", choice.value === "BLOCKED" ? "text-red-600" : "text-sky-700")}
                          aria-hidden="true"
                        />
                        {choice.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{choice.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors?.type?.[0] ? (
              <p className="mt-1 text-xs font-medium text-red-600" role="alert">
                {errors.type[0]}
              </p>
            ) : null}
          </fieldset>

          <FormGrid>
            {type === "EXCEPTION" ? (
              <Field
                id="field-maxPerDay"
                label="Commandes autorisées par jour"
                required
                hint="Entre 1 et 50. Remplace la limite de 3."
                error={maxError}
              >
                <Input
                  name="maxPerDay"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={50}
                  step={1}
                  required
                  defaultValue={values?.maxPerDay ?? rule?.maxPerDay ?? 6}
                  className="tabular"
                  {...fieldA11y("field-maxPerDay", maxError, "hint")}
                />
              </Field>
            ) : null}
            <DateField
              name="expiresAt"
              label="Valable jusqu'au (inclus)"
              min={minDate}
              defaultDate={rule?.expiresAt}
              defaultValue={values?.expiresAt}
              hint="Laissez vide pour une règle sans date de fin."
              error={errors?.expiresAt}
            />
            <TextareaField
              name="reason"
              label="Motif"
              required
              rows={3}
              maxLength={300}
              defaultValue={values?.reason ?? rule?.reason ?? ""}
              hint="Pourquoi cette décision ? Ex. « Commandes fictives répétées » ou « Crèche : commandes groupées »."
              error={errors?.reason}
              wrapperClassName="sm:col-span-2"
            />
          </FormGrid>
        </div>
      </FormSection>
      <FormActions cancelHref={RULES_PATH} submitLabel={rule ? "Enregistrer la règle" : "Créer la règle"} />
    </form>
  );
}
