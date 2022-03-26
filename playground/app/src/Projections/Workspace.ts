import { projection } from "@valkyr/ledger-client";
import { uuid } from "@valkyr/utils";
import { WorkspaceCreated } from "stores";

import { Workspace } from "../Models/Workspace";

projection.on<WorkspaceCreated>("WorkspaceCreated", async ({ streamId, data: { name }, meta: { auditor } }) => {
  await Workspace.insert({
    id: streamId,
    name,
    members: [
      {
        id: uuid(),
        accountId: auditor
      }
    ]
  });
});
