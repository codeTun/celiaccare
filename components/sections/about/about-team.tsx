import { ClipboardCheck, GraduationCap, MessagesSquare, Salad, type LucideIcon } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AboutDict } from "@/i18n/resources/fr/about";

/**
 * "L'équipe": described by roles (no names, no photos), each in a doorway-shaped "portrait".
 * `id` lets the hero's "on this page" links jump here.
 */
export function AboutTeam({ about, id }: { about: AboutDict; id?: string }) {
  const { team } = about;
  const roles: { key: string; icon: LucideIcon; title: string; text: string }[] = [
    { key: "students", icon: GraduationCap, ...team.roles.students },
    { key: "dietitian", icon: Salad, ...team.roles.dietitian },
    { key: "verifiers", icon: ClipboardCheck, ...team.roles.verifiers },
    { key: "moderators", icon: MessagesSquare, ...team.roles.moderators },
  ];

  return (
    <section id={id} className="scroll-mt-24 py-16 sm:py-24">
      <Container>
        <SectionHeading align="center" eyebrow={team.eyebrow} title={team.title} description={team.description} />
        <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {roles.map(({ key, icon: Icon, title, text }) => (
            <li
              key={key}
              className="flex flex-col items-center rounded-[var(--radius-card)] border border-line bg-white p-6 text-center shadow-soft"
            >
              <span
                aria-hidden="true"
                className="arch relative isolate grid h-24 w-20 place-items-center overflow-hidden bg-brand-50 text-brand-700 ring-4 ring-brand-50/70"
              >
                <span className="absolute inset-0 -z-10 bg-khatam" />
                <Icon className="size-8" strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 text-base font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
