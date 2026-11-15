import { Search } from "lucide-react";

import { FilterForm } from "@/components/directory/filter-form";
import { Field, Input, SelectField } from "@/components/ui/form";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { ProducersDict } from "@/i18n/resources/fr/producers";
import { GOVERNORATES } from "@/lib/tunisia";
import { GUARANTEE_LEVELS, type GuaranteeLevel, type Locale, type ProducerType } from "@/types";

/** The filters as they appear in the URL of /artisans ("" = no filter). */
export type ProducerSearch = {
  q: string;
  type: ProducerType | "";
  governorate: string;
  guarantee: GuaranteeLevel | "";
};

/**
 * Filters of the artisans directory (spec EF-01/EF-02): search, governorate and
 * guarantee level. The type is chosen with <ProducerTypeChips> and kept here in a
 * hidden field. GET form: /artisans?q=...&type=BAKERY&gouvernorat=...&garantie=...
 */
export function ProducerFilters({
  locale,
  values,
  common,
  dict,
  className,
}: {
  locale: Locale;
  values: ProducerSearch;
  common: CommonDict;
  dict: ProducersDict;
  className?: string;
}) {
  const hasFilters = Boolean(values.q || values.type || values.governorate || values.guarantee);

  return (
    <FilterForm
      action={localePath(locale, "/artisans")}
      label={dict.filters.label}
      submitLabel={dict.filters.submit}
      resetLabel={dict.filters.reset}
      showReset={hasFilters}
      className={className}
      extra={values.type ? <input type="hidden" name="type" value={values.type} /> : null}
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
