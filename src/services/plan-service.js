import { LOCATION, PLANTYPE, stageDescriptions } from "../constants.js";
import { appContext } from "../infrastructure/app-db-context.js";
import { ValidationError } from "../sal/primitives/index.js";
import { Result } from "../sal/shared/index.js";
import { currentUser } from "./authorization.js";

export async function addNewPlan(plan) {
  console.log("inserting plan", plan);

  const planType = ko.unwrap(plan.RecordType.Value);

  if (!planType) {
    return Result.Error(PlanErrors.recordTypeNotSetError);
  }

  let result;

  if (plan.isCAR() && !plan.isSelfInitiated()) {
    const loc = ko.unwrap(plan.CGFSLocation.Value);
    if (loc == LOCATION.BANGKOK) {
      plan.ProcessStage.Value(stageDescriptions.ProblemApprovalQTMB.stage);
    } else {
      plan.ProcessStage.Value(stageDescriptions.ProblemApprovalQTM.stage);
    }
  }

  if (plan.isCAP()) {
    plan.SelfInitiated.Value("Yes");
  }

  if (plan.isSelfInitiated()) {
    plan.ProcessStage.Value(stageDescriptions.DevelopingActionPlan.stage);

    // Set the next target date
    const today = new Date();
    const target_deadline = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 30
    );

    plan.NextTargetDate.set(target_deadline);

    const user = currentUser;

    plan.ProblemResolverName.set(user);

    // We only mark it as submitted once it's been approved.
    plan.SubmittedDate.Value(new Date());
  }

  plan.flatten();

  plan.AuthorName.Value(currentUser.Title);

  plan.Active.Value(true);

  return appContext.Plans.AddEntity(plan);
}

export async function editPlan(plan, view) {
  plan.flatten();

  return appContext.Plans.UpdateEntity(plan, view);
}

const PlanErrors = {
  recordTypeNotSetError: new ValidationError(
    "add-new-plan",
    "required-field",
    "Plan type is not set!"
  ),
};
