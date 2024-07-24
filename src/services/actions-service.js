import { ACTIONSTATES } from "../constants.js";
import { Action } from "../entities/index.js";
import { appContext } from "../infrastructure/app-db-context.js";
import { Result } from "../sal/shared/index.js";

export async function editAction(plan, action) {
  const stage = ko.unwrap(plan.ProcessStage.Value);

  if (["Developing Action Plan", "Pending QSO Plan Approval"].includes(stage)) {
    return appContext.Actions.UpdateEntity(action, Action.Views.Edit);
  }

  const revisions = action.RevisionCount.Value() ?? 0;
  action.RevisionCount.Value(revisions++);
  // Plan requires QSO approval

  action.ImplementationStatus.Value(ACTIONSTATES.QSOAPPROVAL);

  return appContext.Actions.UpdateEntity(action, Action.Views.Edit);
}
