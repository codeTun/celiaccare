import { Search } from "lucide-react";

import { FilterForm } from "@/components/directory/filter-form";
import { Checkbox, Field, Input, SelectField } from "@/components/ui/form";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { RestaurantsDict } from "@/i18n/resources/fr/restaurants";
import { GOVERNORATES } from "@/lib/tunisia";
import { GUARANTEE_LEVELS, type GuaranteeLevel, type Locale } from "@/types";

/** The filters as they appear in the URL of /restaurants ("" = no filter). */
export type RestaurantSearch = {
  q: string;
  governorate: string;
  guarantee: GuaranteeLevel | "";
  partnerOnly: boolean;
};

/**
 * Filters of the restaurants directory (spec EF-01/EF-02): search, governorate,
 * guarantee level and "partners only". Sent as a GET form:
 * /restaurants?q=...&gouvernorat=...&garantie=...&partenaires=1
 */
export function RestaurantFilters({
  locale,
  values,
  common,
  dict,
  className,
}: {
  locale: Locale;
  values: RestaurantSearch;
  common: CommonDict;
  dict: RestaurantsDict;
  className?: string;
}) {
  const hasFilters = Boolean(values.q || values.governorate || values.guarantee || values.partnerOnly);

  return (
    <FilterForm
      action={localePath(locale, "/restaurants")}
      label={dict.filters.label}
      submitLabel={dict.filters.submit}
      resetLabel={dict.filters.reset}
      showReset={hasFilters}
      className={className}
      extra={
        // "Partners only" toggle: the pill turns green when it is checked
        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2.5 rounded-full border border-line-strong bg-white py-1.5 ps-3.5 pe-4 transition-colors hover:border-brand-300 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
          <Checkbox name="partenaires" value="1" defaultChecked={values.partnerOnly} />
          <span className="text-sm leading-tight font-semibold text-ink">
            {dict.filters.partnersOnly}
            <span className="block text-xs font-normal text-ink-subtle">{dict.filters.partnersOnlyHint}</span>
          </span>
        </label>
      }
    >
      <Field id="filter-q" label={dict.filters.search} className="sm:col-span-2 md:col-span-1">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <Input
            id="filter-q"
            type="search"
            name="q"
            defaultValue={values.q}
            placeholder={dict.filters.searchPlaceholder}
            maxLength={100}
            enterKeyHint="search"
            autoComplete="off"
            className="ps-10"
          />
        </div>
      </Field>

      <SelectField id="filter-governorate" name="gouvernorat" label={dict.filters.governorate} defaultValue={values.governorate}>
        <option value="">{common.labels.allGovernorates}</option>
        {GOVERNORATES.map((governorate) => (
          <option key={governorate.value} value={governorate.value}>
            {locale === "ar" ? governorate.ar : governorate.value}
          </option>
        ))}
      </SelectField>

      <SelectField id="filter-guarantee" name="garantie" label={dict.filters.guarantee} defaultValue={values.guarantee}>
        <option value="">{dict.filters.allGuarantees}</option>
        {GUARANTEE_LEVELS.map((level) => (
          <option key={level} value={level}>
            {common.guarantee[level].label}
          </option>
        ))}
      </SelectField>
    </FilterForm>
  );
}
