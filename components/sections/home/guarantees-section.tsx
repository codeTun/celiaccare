import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { HomeDict } from "@/i18n/resources/fr/home";
import type { Locale } from "@/types";

import { GuaranteeLevels } from "../guarantee-levels";

/** The 3 guarantee levels explained (key trust content of the spec, §5.2). */
export function GuaranteesSection({ lang, common, home }: { lang: Locale; common: CommonDict; home: HomeDict }) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow={home.guarantees.eyebrow}
          title={home.guarantees.title}
          description={home.guarantees.description}
        />
        <GuaranteeLevels
          className="mt-10 sm:mt-12"
          common={common}
          texts={home.guarantees}
          learnMoreHref={localePath(lang, "/guide-sans-gluten")}
        />
      </Container>
    </section>
  );
}
