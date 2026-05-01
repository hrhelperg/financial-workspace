import "server-only";
import {
  getCurrentUser,
  getCurrentWorkspace,
  isAuthenticationError,
  isAuthorizationError,
  requireWorkspaceMember,
  requireWorkspaceRole,
  type WorkspaceContext,
  type WorkspaceRole
} from "./auth";

export {
  getCurrentUser,
  getCurrentWorkspace,
  isAuthenticationError,
  isAuthorizationError,
  requireWorkspaceMember,
  requireWorkspaceRole
};
export type { WorkspaceContext, WorkspaceRole };
