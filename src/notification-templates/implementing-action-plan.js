import { html } from "../constants.js";
import { getAnchorRoleLinkToPlan } from "../services/plan-service.js";

export function implementingActionPlanTemplate(plan) {
  const location = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();

  return html`
    <p>The following action plan has been approved:</p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      You are receiving this email because you have been designated as an action
      plan responsible person.
    </p>
    <p>Please visit the CAP/CAR tool to view and complete your actions.</p>
  `;
}

export function implementingActionPlanRejectedTemplate(plan, rejection) {
  const location = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();

  return html`
    <p>The following action plan has been <span>rejected</span>:</p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      Rejection Reason:<br />
      ${rejection.Reason.Value()}
    </p>
    <p>
      You are receiving this email because you have been designated as an action
      plan responsible person.
    </p>
    <p>Please visit the CAP/CAR tool to view and complete your actions.</p>
  `;
}
