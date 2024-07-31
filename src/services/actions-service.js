import { ACTIONSTATES } from "../constants.js";
import { Action } from "../entities/index.js";
import { appContext } from "../infrastructure/app-db-context.js";
import { Result } from "../sal/shared/index.js";

export function getNextActionId(planId, actions) {
  let actionNoMax = 1;
  actions.forEach((action) => {
    let actionNo = parseInt(action.ActionID.split("-")[2].split("A")[1]);
    if (actionNo >= actionNoMax) {
      actionNoMax = actionNo + 1;
    }
  });

  const actionCountPadded = actionNoMax.toString().padStart(2, "0");
  return `${planId}-A${actionCountPadded}`;
}

export async function submitNewAction(plan, action) {
  console.log("submitting action: " + action.ActionID.Value(), action);
  action.ImplementationStatus.Value(ACTIONSTATES.PLANAPPROVAL);
  action.RevisionCount.Value(0);
  return appContext.Actions.AddEntity(action);
}

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
