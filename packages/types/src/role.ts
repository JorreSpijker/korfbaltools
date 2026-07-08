export const ROLES = ["admin", "coach", "player", "referee"] as const;

export type Role = (typeof ROLES)[number];

export const CAPABILITIES = ["teamindeling", "statistieken"] as const;

export type Capability = (typeof CAPABILITIES)[number];
