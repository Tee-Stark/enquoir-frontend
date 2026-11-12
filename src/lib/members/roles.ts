import type { Role } from "./queries";

/**
 * The fixed role hierarchy from the OpenAPI contract's Role schema -
 * "owner > admin > operator > viewer". Shared by every view that gates on
 * role so there is exactly one copy to keep in sync with the backend
 * (a closed string-literal union plus Record<Role, ...> already forces a
 * compile error here if the contract ever adds a role).
 */
export const ROLES: Role[] = ["owner", "admin", "operator", "viewer"];

export const ROLE_RANK: Record<Role, number> = { owner: 4, admin: 3, operator: 2, viewer: 1 };

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  operator: "Operator",
  viewer: "Viewer",
};

/** Owners and admins manage other members; nobody else does. */
export function canManageMembers(viewerRole: Role | undefined): boolean {
  return viewerRole === "owner" || viewerRole === "admin";
}

/**
 * Roles a viewer may assign (to a member) or offer (on an invitation) -
 * nobody grants a role above their own.
 */
export function selectableRoles(viewerRole: Role | undefined): Role[] {
  return viewerRole ? ROLES.filter((r) => ROLE_RANK[r] <= ROLE_RANK[viewerRole]) : [];
}

/**
 * Whether the viewer may change the role of, or remove, a member who holds
 * `memberRole` - an admin never touches a peer admin or an owner; an owner
 * may touch anyone.
 */
export function canEditMemberWithRole(viewerRole: Role | undefined, memberRole: Role): boolean {
  return (
    canManageMembers(viewerRole) &&
    (viewerRole === "owner" || ROLE_RANK[memberRole] < ROLE_RANK["admin"])
  );
}
