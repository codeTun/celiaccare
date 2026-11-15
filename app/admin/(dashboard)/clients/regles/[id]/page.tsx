import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RULES_PATH } from "@/components/admin/clients/clients-routes";
import { PhoneRuleForm } from "@/components/admin/clients/phone-rule-form";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { FormSection } from "@/components/admin/form-section";
import { FormSkeleton } from "@/components/admin/orders/skeletons";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatPhone } from "@/lib/format";
import { tunisDayKey } from "@/lib/tunisia";
import { idSchema } from "@/lib/validators";
import { getPhoneRule } from "@/models/fetchers/admin/phone-rules";

import { deletePhoneRuleAction, updatePhoneRuleAction } from "../actions";

export const metadata: Metadata = { title: "Modifier une règle téléphone" };

/** /admin/clients/regles/[id] — change a rule (type, daily limit, reason, end date) or delete it. */
export default function EditPhoneRulePage({ params }: PageProps<"/admin/clients/regles/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Modifier la règle"
        description="Les changements s'appliquent dès la prochaine commande de ce numéro."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: "Règles téléphone", href: RULES_PATH },
          { label: "Modifier" },
        ]}
      />
      <Suspense fallback={<FormSkeleton fields={4} />}>
        <EditRuleForm params={params} />
      </Suspense>
    </>
  );
}

async function EditRuleForm({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const ruleId = idSchema.safeParse((await params).id);
  if (!ruleId.success) notFound();

  const rule = await getPhoneRule(ruleId.data);
  if (!rule) notFound();

  return (
    <div className="space-y-6">
      <PhoneRuleForm action={updatePhoneRuleAction.bind(null, rule.id)} rule={rule} minDate={tunisDayKey(new Date())} />
      <FormSection
        title="Supprimer la règle"
        description={`Créée le ${formatDateTime(rule.createdAt)}. Le numéro reviendra à la limite normale de 3 commandes par jour.`}
        actions={
          <ConfirmDeleteButton
            action={deletePhoneRuleAction.bind(null, rule.id)}
            label="Supprimer la règle"
            title={`Supprimer la règle du ${formatPhone(rule.phone)} ?`}
            description="Le numéro revient à la limite normale de 3 commandes par jour. Cette action est définitive."
          />
        }
      >
        <p className="text-sm text-ink-muted">
          Pour une pause temporaire, indiquez plutôt une date de fin à la règle.
        </p>
      </FormSection>
    </div>
  );
}
