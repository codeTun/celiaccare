"use client";

import { useActionState } from "react";

import { FormActions, FormGrid, FormMessage } from "@/components/admin/admin-form";
import { FormSection } from "@/components/admin/form-section";
import { EnumSelectField } from "@/components/admin/select-fields";
import { SwitchField } from "@/components/admin/switch-field";
import { TextareaField, TextField } from "@/components/ui/form";
import { formatPhone } from "@/lib/format";
import { idleState, type ActionState } from "@/lib/validators";
import type { AdminDelivererForm } from "@/types/admin-data";

import { VEHICLE_LABELS } from "./delivery-labels";
import { DELIVERERS_PATH } from "./delivery-routes";

/**
 * Create / edit a delivery person (livreur): name, phone, vehicle, covered zone,
 * availability and internal notes. The Server Action is bound on the server.
 *
 * @example
 * <DelivererForm action={createDelivererAction} />
 * <DelivererForm action={updateDelivererAction.bind(null, deliverer.id)} deliverer={deliverer} />
 */
export function DelivererForm({
  action,
  deliverer,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  /** The deliverer being edited (absent when creating). */
  deliverer?: AdminDelivererForm;
}) {
  const [state, formAction] = useActionState(action, idleState);
  const values = state.values;
  const errors = state.fieldErrors;
  const isActive = values ? values.isActive === "on" : (deliverer?.isActive ?? true);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />
      <FormSection title="Livreur" description="Ces informations restent internes : elles ne sont jamais affichées sur le site.">
        <FormGrid>
          <TextField
            name="name"
            label="Nom complet"
            required
            maxLength={80}
            autoComplete="off"
            defaultValue={values?.name ?? deliverer?.name ?? ""}
            error={errors?.name}
          />
          <TextField
            name="phone"
            type="tel"
            label="Téléphone"
            required
            maxLength={20}
            autoComplete="off"
            placeholder="20 123 456"
            defaultValue={values?.phone ?? (deliverer ? formatPhone(deliverer.phone) : "")}
            hint="Numéro tunisien à 8 chiffres. Un numéro par livreur."
            error={errors?.phone}
          />
          <EnumSelectField
            name="vehicle"
            label="Véhicule"
            required
            placeholder="Choisir…"
            options={VEHICLE_LABELS}
            defaultValue={values?.vehicle ?? deliverer?.vehicle ?? ""}
            error={errors?.vehicle}
          />
          <TextField
            name="zone"
            label="Zone couverte"
            maxLength={120}
            placeholder="Tunis, Ariana, Ben Arous"
            defaultValue={values?.zone ?? deliverer?.zone ?? ""}
            hint="Gouvernorat(s) ou quartiers où il livre (texte libre)."
            error={errors?.zone}
          />
          <TextareaField
            name="notes"
            label="Notes internes"
            rows={3}
            maxLength={500}
            defaultValue={values?.notes ?? deliverer?.notes ?? ""}
            hint="Disponibilités, remarques… Visible seulement par l'équipe."
            error={errors?.notes}
            wrapperClassName="sm:col-span-2"
          />
          <SwitchField
            name="isActive"
            label="Disponible"
            description="Un livreur désactivé garde son historique mais ne peut plus recevoir de nouvelles commandes."
            defaultChecked={isActive}
            className="sm:col-span-2"
          />
        </FormGrid>
      </FormSection>
      <FormActions cancelHref={DELIVERERS_PATH} submitLabel={deliverer ? "Enregistrer le livreur" : "Ajouter le livreur"} />
    </form>
  );
}
