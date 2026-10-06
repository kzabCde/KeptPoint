export type BusinessWorkspace = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

type ProgramRow = {
  id: string;
  name: string;
  slug: string;
};

type StaffRow = {
  role: string;
  programs: ProgramRow | ProgramRow[] | null;
};

export function mergeBusinessWorkspaces(
  owned: ProgramRow[] = [],
  staffed: StaffRow[] = [],
): BusinessWorkspace[] {
  const byId = new Map<string, BusinessWorkspace>();

  for (const program of owned) {
    byId.set(program.id, { ...program, role: "owner" });
  }

  for (const row of staffed) {
    const program = Array.isArray(row.programs) ? row.programs[0] : row.programs;
    if (!program || byId.has(program.id)) continue;
    byId.set(program.id, { ...program, role: row.role });
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}
