import { LOCATION, PLANTYPE, stageDescriptions } from "../constants.js";
import { ValidationError } from "../sal/primitives/index.js";
import { Result } from "../sal/shared/index.js";

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
    }
  }
}

async function submitNewCAR(plan) {}

const PlanErrors = {
  recordTypeNotSetError: new ValidationError(
    "add-new-plan",
    "required-field",
    "Plan type is not set!"
  ),
};
