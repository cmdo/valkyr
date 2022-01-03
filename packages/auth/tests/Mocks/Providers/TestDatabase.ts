import { JSONRole, Role } from "../../../src/Lib/Role";
import type { Database } from "../../../src/Services/Database";
import type { Operation } from "../../../src/Types";

export class TestDatabase implements Database {
  public store: JSONRole[] = [];

  /**
   * Retrieve role data from persistent database solution.
   */
  public async getRole(roleId: string): Promise<JSONRole | undefined> {
    return this.store.find((role) => role.roleId === roleId);
  }

  /**
   * Set permission configuration for the given role.
   */
  public async setPermissions(roleId: string, operations: Operation<any, any>[]): Promise<void> {
    const role = this.store.find((role) => role.roleId === roleId);
    if (!role) {
      throw new Error(`Permission Violation: Cannot set permissions, role '${roleId}' does not exist.`);
    }
    for (const operation of operations) {
      switch (operation.type) {
        case "set": {
          assign(role, operation.resource, operation.action, operation.data);
          break;
        }
        case "unset": {
          remove(role, operation.resource, operation.action);
          break;
        }
      }
    }
    this.store = this.store.map((data) => (data.roleId === role.roleId ? role : data));
  }

  /**
   * Retrieve all permissions assigned to the given member within the provided tenant.
   * A member can be assigned to multiple roles within a tenant so the permission
   * method should retrieve all roles for the given member and combine them into a single
   * permissions object.
   */
  public async getPermissions<Permissions extends Role["permissions"]>(tenantId: string, memberId: string): Promise<Permissions> {
    return this.store
      .filter((role) => role.tenantId !== tenantId || !role.members.includes(memberId))
      .reduce((permissions, role) => leftMerge(permissions, role.permissions), {} as Permissions);
  }

  /**
   * Add a member to given role.
   */
  public async addMember(roleId: string, memberId: string): Promise<void> {
    this.store = this.store.map((role) => {
      if (role.roleId === roleId) {
        return {
          ...role,
          members: [...role.members, memberId]
        };
      }
      return role;
    });
  }

  /**
   * Remove a member from given role.
   */
  public async delMember(roleId: string, memberId: string): Promise<void> {
    this.store = this.store.map((role) => {
      if (role.roleId === roleId) {
        return {
          ...role,
          members: role.members.reduce((members: string[], id) => {
            if (id !== memberId) {
              members.push(id);
            }
            return members;
          }, [])
        };
      }
      return role;
    });
  }
}

function leftMerge(source: any, data: any): any {
  for (const key in data) {
    if (typeof data[key] === "object" && !Array.isArray(data[key]) && Object.prototype.toString.call(data[key]) !== "[object Date]") {
      source[key] = leftMerge(source[key] || {}, data[key]);
    } else {
      source[key] = data[key];
    }
  }
  return source;
}

function assign(role: JSONRole, resource: string, action: string, data: any): void {
  if (!role.permissions[resource]) {
    role.permissions[resource] = {};
  }
  if (!role.permissions[resource][action]) {
    role.permissions[resource][action] = {};
  }
  role.permissions[resource][action] = data;
}

function remove(role: JSONRole, resource: string, action?: string): void {
  if (action) {
    delete role.permissions[resource][action];
  } else {
    delete role.permissions[resource];
  }
}
