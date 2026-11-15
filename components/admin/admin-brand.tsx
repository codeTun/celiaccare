import Link from "next/link";

import { Logo } from "@/components/logo";

/** Site logo + "ADMIN" pill, link at the top of the sidebar and of the mobile menu (dark background). */
export function AdminBrand() {
  return (
    <Link href="/admin" className="flex items-center gap-2 rounded-xl">
      <Logo tone="light" />
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.62rem] font-bold tracking-[0.14em] text-brand-100 uppercase ring-1 ring-white/15">
        Admin
      </span>
    </Link>
  );
}
