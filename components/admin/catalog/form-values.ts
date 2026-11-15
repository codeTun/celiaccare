/* ==========================================================================
   Default values of the catalogue forms.
   After a failed submission the Server Action sends back the submitted values
   (ActionState.values) and the form shows THEM, not the saved ones: nothing the
   admin typed is lost. Unchecked boxes are not sent by the browser, so after a
   failed submission "absent" means "unchecked".
   ========================================================================== */

/** The values sent back by the action after an error (undefined before any submission). */
export type SubmittedValues = Record<string, string> | undefined;

/** Text of a field: the submitted value, else the saved value ("" when there is none). */
export function textValue(values: SubmittedValues, name: string, saved?: string | number | null): string {
  if (values) return values[name] ?? "";
  return saved == null ? "" : String(saved);
}

/** State of a checkbox or switch. */
export function checkedValue(values: SubmittedValues, name: string, saved: boolean): boolean {
  return values ? values[name] === "on" : saved;
}

/** Ticked ids of a checkbox list (the action sends them back joined with commas: "4,10,11"). */
export function idsValue(values: SubmittedValues, name: string, saved: readonly number[]): number[] {
  if (!values) return [...saved];
  return (values[name] ?? "")
    .split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
}

/**
 * React key of the fields: it changes when the action sends back different values, so the
 * fields are rebuilt with them (selects and checkboxes do not follow a new default otherwise).
 */
export function valuesKey(values: SubmittedValues): string {
  return values ? JSON.stringify(values) : "saved";
}
