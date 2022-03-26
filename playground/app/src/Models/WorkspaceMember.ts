import { Collection, Model } from "@valkyr/db";
import { ledger } from "@valkyr/ledger-client";
import { uuid } from "@valkyr/utils";
import { events, WorkspaceMember as WorkspaceMemberAttributes } from "stores";

import { adapter } from "../Providers/IdbAdapter";

type Attributes = WorkspaceMemberAttributes;

export class WorkspaceMember extends Model<Attributes> {
  public static readonly $collection = new Collection<Attributes>("workspace-members", adapter);

  public readonly workspaceId: Attributes["workspaceId"];
  public readonly accountId: Attributes["accountId"];

  constructor(document: Attributes) {
    super(document);

    this.workspaceId = document.workspaceId;
    this.accountId = document.accountId;

    Object.freeze(this);
  }

  public static async findByWorkspace(workspaceId: string) {
    return this.findOne({ workspaceId });
  }

  public static async findByAccount(accountId: string) {
    return this.find({ accountId });
  }

  public static async add(workspaceId: string, accountId: string, auditor?: string) {
    const count = await this.count({ workspaceId, accountId });
    if (count > 0) {
      throw new Error(`Workspace Member Violation: Account ${accountId} is already a member of this workspace.`);
    }
    const memberId = uuid();
    ledger.push(events.workspaceMember.added(memberId, { workspaceId, accountId }, { auditor: auditor ?? memberId }));
  }

  public async remove(auditor: string) {
    ledger.push(events.workspaceMember.removed(this.id, {}, { auditor }));
  }

  public toJSON(): Attributes {
    return super.toJSON({
      workspaceId: this.workspaceId,
      accountId: this.accountId
    });
  }
}
