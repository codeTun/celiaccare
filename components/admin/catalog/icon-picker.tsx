import { CATEGORY_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Icon of a category, as a grid of radio cards (icon + label). Spec 6.3: one distinct
 * icon per category, so icons already used by ANOTHER category are shown disabled
 * with its name ("Utilisée par « Dattes »"). The server checks it again.
 *
 * @example
 * <CategoryIconPicker defaultValue="bread" savedValue={category.icon}
 *   usedBy={{ dates: "Dattes" }} error={state.fieldErrors?.icon} />
 */
export function CategoryIconPicker({
  name = "icon",
  defaultValue,
  savedValue,
  usedBy,
  error,
}: {
  name?: string;
  /** Icon checked when the form opens. */
  defaultValue?: string;
  /** Saved icon of this category: always selectable, even if another category uses it too. */
  savedValue?: string;
  /** icon key → name of the OTHER category that uses it. */
  usedBy: Record<string, string>;
  error?: string | string[] | null;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  const errorId = `${name}-picker-error`;

  return (
    <fieldset
      className="min-w-0"
      aria-describedby={message ? errorId : `${name}-picker-hint`}
      data-invalid={message ? "true" : undefined}
    >
      <legend className="text-sm font-semibold text-ink">
        Icône de la catégorie
        <span className="ms-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      </legend>
      <p id={`${name}-picker-hint`} className="mt-0.5 text-xs text-ink-subtle">
        Affichée dans le menu, les filtres et à la place des photos manquantes. Une icône différente par catégorie.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {Object.entries(CATEGORY_ICONS).map(([key, { icon: Icon, label }]) => {
          const owner = Object.hasOwn(usedBy, key) ? usedBy[key] : null;
          const disabled = owner !== null && key !== savedValue;
          return (
            <label
              key={key}
              title={disabled ? `Déjà utilisée par « ${owner} »` : label}
              className={cn(
                "flex min-w-0 items-center gap-2.5 rounded-2xl border border-line bg-white p-2.5 transition-colors",
                "has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50/60 has-[:checked]:ring-1 has-[:checked]:ring-brand-500",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600",
                disabled ? "cursor-not-allowed bg-canvas/70 opacity-60" : "cursor-pointer hover:border-brand-200",
              )}
            >
              <input
                type="radio"
                name={name}
                value={key}
                required
                disabled={disabled}
                defaultChecked={defaultValue === key}
                className="sr-only"
              />
              <span
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                aria-hidden="true"
              >
                <Icon className="size-[18px]" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[13px] font-semibold text-ink">{label}</span>
                {owner ? (
                  <span className="block truncate text-[11px] text-ink-subtle">
                    {disabled ? "Utilisée par" : "Aussi utilisée par"} « {owner} »
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>

      {message ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
