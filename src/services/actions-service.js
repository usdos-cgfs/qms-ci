import { ACTIONSTATES, stageDescriptions } from "../constants.js";
import { Action } from "../entities/index.js";
import { appContext } from "../infrastructure/app-db-context.js";
import { Result } from "../sal/shared/index.js";
import { actionRequiresApprovalNotification } from "./notifications-service.js";

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
  const planStage = ko.unwrap(plan.ProcessStage.Value);
  const actionStatus = ko.unwrap(action.ImplementationStatus.Value);

  // If the plan hasn't been approved, or the action is pending approval,
  // we don't need to increment
  const planNotApproved = [
    stageDescriptions.DevelopingActionPlan.stage,
    stageDescriptions.PlanApprovalQSO.stage,
  ].includes(planStage);

  if (planNotApproved || actionStatus == ACTIONSTATES.QSOAPPROVAL) {
    return appContext.Actions.UpdateEntity(action, Action.Views.Edit);
  }

  // Plan requires QSO approval
  let revisions = action.RevisionCount.Value() ?? 0;
  action.RevisionCount.Value(++revisions);

  action.ImplementationStatus.Value(ACTIONSTATES.QSOAPPROVAL);

  const result = await appContext.Actions.UpdateEntity(
    action,
    Action.Views.EditApproval
  );

  if (result.isFailure) return result;

  return actionRequiresApprovalNotification(plan, action);
}
