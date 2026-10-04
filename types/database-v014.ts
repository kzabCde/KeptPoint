import type { Database as GeneratedDatabase } from "@/types/database";

type ProfilesTable = GeneratedDatabase["public"]["Tables"]["profiles"];

type ProfilesWithPasswordState = {
  Row: ProfilesTable["Row"] & { password_set: boolean };
  Insert: ProfilesTable["Insert"] & { password_set?: boolean };
  Update: ProfilesTable["Update"] & { password_set?: boolean };
  Relationships: ProfilesTable["Relationships"];
};

export type Database = Omit<GeneratedDatabase, "public"> & {
  public: Omit<GeneratedDatabase["public"], "Tables"> & {
    Tables: Omit<GeneratedDatabase["public"]["Tables"], "profiles"> & {
      profiles: ProfilesWithPasswordState;
    };
  };
};
