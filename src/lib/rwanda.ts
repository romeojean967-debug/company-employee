export const rwandaDistricts: Record<string, string[]> = {
  "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
  Northern: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  Southern: [
    "Gisagara",
    "Huye",
    "Kamonyi",
    "Muhanga",
    "Nyamagabe",
    "Nyanza",
    "Nyaruguru",
    "Ruhango",
  ],
  Eastern: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
  Western: [
    "Karongi",
    "Ngororero",
    "Nyabihu",
    "Nyamasheke",
    "Rubavu",
    "Rusizi",
    "Rutsiro",
  ],
};

export const rwandaProvinces = Object.keys(rwandaDistricts);

export type PasswordCheck = { label: string; ok: boolean };

export function passwordChecks(pw: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", ok: pw.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(pw) },
    { label: "One lowercase letter", ok: /[a-z]/.test(pw) },
    { label: "One number", ok: /[0-9]/.test(pw) },
    { label: "One symbol", ok: /[^A-Za-z0-9]/.test(pw) },
  ];
}

export function passwordScore(pw: string) {
  return passwordChecks(pw).filter((c) => c.ok).length;
}

export function isStrongPassword(pw: string) {
  return passwordScore(pw) === 5;
}
