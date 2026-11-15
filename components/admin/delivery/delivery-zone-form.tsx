"use client";

import { useActionState } from "react";

import { FormActions, FormGrid, FormMessage } from "@/components/admin/admin-form";
import { FormSection } from "@/components/admin/form-section";
import { MoneyField } from "@/components/admin/money-field";
import { EnumSelectField } from "@/components/admin/select-fields";
import { SwitchField } from "@/components/admin/switch-field";
import { TextField } from "@/components/ui/form";
import { idleState, type ActionState } from "@/lib/validators";
import type { AdminDeliveryZoneForm } from "@/types/admin-data";

import { ZONES_PATH } from "./delivery-routes";

/**
 * Create / edit a delivery zone (one per governorate): fee, announced delay, free delivery
 * threshold and open / closed. The Server Action is bound on the server and passed as `action`.
 *
 * @example
 * <DeliveryZoneForm action={createDeliveryZoneAction} governorates={freeGovernorates} />
 * <DeliveryZoneForm action={updateDeliveryZoneAction.bind(null, zone.id)} zone={zone} governorates={choices} />
 */
export function DeliveryZoneForm({
  action,
  zone,
  governorates,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  /** The zone being edited (absent when creating). */
  zone?: AdminDeliveryZoneForm;
  /** Governorates that can be chosen (those without a zone yet, plus the current one). */
  governorates: string[];
}) {
  const [state, formAction] = useActionState(action, idleState);
  const values = state.values;
  const errors = state.fieldErrors;
  const isActive = values ? values.isActive === "on" : (zone?.isActive ?? true);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />
      <FormSection
        title="Zone de livraison"
        description="Ce que le client voit avant de commander : frais, délai et livraison offerte."
      >
        <FormGrid>
          <EnumSelectField
            name="governorate"
            label="Gouvernorat"
            required
            placeholder="Choisir un gouvernorat…"
            options={governorates.map((governorate) => ({ value: governorate, label: governorate }))}
            defaultValue={values?.governorate ?? zone?.governorate ?? ""}
            hint="Une seule zone par gouvernorat."
            error={errors?.governorate}
          />
          <TextField
            name="delay"
            label="Délai de livraison annoncé"
            required
            maxLength={40}
            placeholder="24–48 h"
            defaultValue={values?.delay ?? zone?.delay ?? ""}
            hint="Affiché au client avant la commande, ex. « 24 h » ou « 48–72 h »."
            error={errors?.delay}
          />
          <MoneyField
            name="fee"
            label="Frais de livraison"
            required
            defaultMillimes={zone?.fee}
            defaultValue={values?.fee}
            hint="Payés par le client. 0 = livraison gratuite."
            error={errors?.fee}
          />
          <MoneyField
            name="freeFrom"
            label="Livraison offerte à partir de"
            defaultMillimes={zone?.freeFrom}
            defaultValue={values?.freeFrom}
            hint="Montant des articles à partir duquel la livraison est gratuite. Laissez vide pour ne jamais l'offrir."
            error={errors?.freeFrom}
          />
          <SwitchField
            name="isActive"
            label="Livraison ouverte"
            description="Désactivez pour suspendre la livraison dans ce gouvernorat sans perdre ces réglages."
            defaultChecked={isActive}
            className="sm:col-span-2"
          />
        </FormGrid>
      </FormSection>
      <FormActions cancelHref={ZONES_PATH} submitLabel={zone ? "Enregistrer la zone" : "Créer la zone"} />
    </form>
  );
}
