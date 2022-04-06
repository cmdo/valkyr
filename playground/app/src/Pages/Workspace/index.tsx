import { router } from "@valkyr/react";
import styled from "styled-components";

import { useWorkspace } from "~Hooks/UseWorkspace";

import { WorkspaceInvites } from "./Components/WorkspaceInvites";

/*
 |--------------------------------------------------------------------------------
 | Component
 |--------------------------------------------------------------------------------
 */

export function Workspace() {
  const workspace = useWorkspace(router.params.get("workspace"));
  if (workspace === undefined) {
    return <div>Workspace does not exist, or has been removed</div>;
  }
  return (
    <S.Container>
      <div>{workspace.name}</div>
      <WorkspaceInvites workspaceId={workspace.id} />
    </S.Container>
  );
}

/*
 |--------------------------------------------------------------------------------
 | Styles
 |--------------------------------------------------------------------------------
 */

const S = {
  Container: styled.div``
};
