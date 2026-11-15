import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RULES_PATH } from "@/components/admin/clients/clients-routes";
import { PhoneRuleForm } from "@/components/admin/clients/phone-rule-form";
import { FormSkeleton } from "@/components/admin/orders/skeletons";
import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { requireAdmin } from "@/lib/auth/session";
import { tunisDayKey } from "@/lib/tunisia";
import { optionalTunisianPhone } from "@/lib/validators";
import { PHONE_RULE_TYPES } from "@/types";

import { createPhoneRuleAction } from "../actions";

export const metadata: Metadata = { title: "Nouvelle règle téléphone" };

/** ?telephone=20123456&type=EXCEPTION (links from the customers list) — invalid values are ignored. */
const prefillSchema = z.object({
  telephone: optionalTunisianPhone.catch(null),
  type: z.enum(PHONE_RULE_TYPES).catch("BLOCKED"),
});

/** /admin/clients/regles/nouvelle — block a number or allow an exception (spec EF-39). */
export default function NewPhoneRulePage({ searchParams }: PageProps<"/admin/clients/regles/nouvelle">) {
  return (
    <>
      <AdminPageHeader
        title="Nouvelle règle téléphone"
        description="La règle s'applique dès la prochaine commande passée avec ce numéro."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: "Règles téléphone", href: RULES_PATH },
          { label: "Nouvelle règle" },
        ]}
      />
      <Suspense fallback={<FormSkeleton fields={4} />}>
        <NewRuleForm searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewRuleForm({ searchParams }: { searchParams: Promise<AdminQuery> }) {
  await requireAdmin();
  const query = await searchParams;
  const prefill = prefillSchema.parse({ telephone: firstParam(query.telephone), type: firstParam(query.type) });

  return (
    <PhoneRuleForm
      action={createPhoneRuleAction}
      defaultPhone={prefill.telephone ?? undefined}
      defaultType={prefill.type}
      minDate={tunisDayKey(new Date())}
    />
  );
}
