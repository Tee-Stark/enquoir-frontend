import { describe, expect, it } from "vitest";
import { canEditMemberWithRole, canManageMembers, selectableRoles } from "./roles";

describe("canManageMembers", () => {
  it("is true only for owner and admin", () => {
    expect(canManageMembers("owner")).toBe(true);
    expect(canManageMembers("admin")).toBe(true);
    expect(canManageMembers("operator")).toBe(false);
    expect(canManageMembers("viewer")).toBe(false);
    expect(canManageMembers(undefined)).toBe(false);
  });
});

describe("selectableRoles", () => {
  it("never offers a role above the viewer's own", () => {
    expect(selectableRoles("owner")).toEqual(["owner", "admin", "operator", "viewer"]);
    expect(selectableRoles("admin")).toEqual(["admin", "operator", "viewer"]);
    expect(selectableRoles("operator")).toEqual(["operator", "viewer"]);
    expect(selectableRoles("viewer")).toEqual(["viewer"]);
  });

  it("returns nothing when the viewer's own role is unknown", () => {
    expect(selectableRoles(undefined)).toEqual([]);
  });
});

describe("canEditMemberWithRole", () => {
  it("lets an owner edit a member of any role, including another owner", () => {
    expect(canEditMemberWithRole("owner", "owner")).toBe(true);
    expect(canEditMemberWithRole("owner", "admin")).toBe(true);
    expect(canEditMemberWithRole("owner", "operator")).toBe(true);
    expect(canEditMemberWithRole("owner", "viewer")).toBe(true);
  });

  it("never lets an admin edit a peer admin or an owner", () => {
    expect(canEditMemberWithRole("admin", "owner")).toBe(false);
    expect(canEditMemberWithRole("admin", "admin")).toBe(false);
  });

  it("lets an admin edit an operator or a viewer", () => {
    expect(canEditMemberWithRole("admin", "operator")).toBe(true);
    expect(canEditMemberWithRole("admin", "viewer")).toBe(true);
  });

  it("never lets an operator or viewer edit anyone", () => {
    for (const memberRole of ["owner", "admin", "operator", "viewer"] as const) {
      expect(canEditMemberWithRole("operator", memberRole)).toBe(false);
      expect(canEditMemberWithRole("viewer", memberRole)).toBe(false);
    }
  });
});
