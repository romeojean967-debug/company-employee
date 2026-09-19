export function formGetter(form: HTMLFormElement) {
  const data = new FormData(form);
  return (key: string) => String(data.get(key) ?? "").trim();
}
