// acl.config.ts
export type Role = "user" | "admin";

export type AclRule = {
  /** Directory prefix to guard. Most-specific first wins. */
  pathPrefix: string;
  allow?: {
    roles?: Role[]; // e.g. ["admin"]
    userIds?: string[]; // stable IDs from your users.json (sub claim)
    usernames?: string[]; // optional convenience; case-insensitive
  };
};

/**
 * Rules are checked by longest path prefix first.
 * If no rule matches a path, we allow it (outside the guarded tree).
 */
export const ACL: AclRule[] = [
  // Example: only user u1 and u2 (and admins) can see /docs/project-a/*
  {
    pathPrefix: "/docs/project-a",
    allow: { userIds: ["darian", "u2"], roles: ["admin"] },
  },

  // Example: only user u1 (and admins) can see /docs/finance/q4/*
  {
    pathPrefix: "/docs/finance/q4",
    allow: { userIds: ["u1"], roles: ["admin"] },
  },

  // Default for everything under /docs: admins only
  { pathPrefix: "/docs", allow: { userIds: ["darian"],  roles: ["admin", "user"] } },

  {
    pathPrefix: "/docs/engineering/designs",
    allow: { userIds: ["u1"], roles: ["admin"] },
  },
];
