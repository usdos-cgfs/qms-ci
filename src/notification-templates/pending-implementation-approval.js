import { html } from "../constants.js";
import { getAnchorRoleLinkToPlan } from "../services/plan-service.js";

export function pendingImplementationApproval(plan, role) {
  const location = plan.Location.Value();
  const title = getAnchorRoleLinkToPlan(plan, role);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();

  return html`
    <p>
      An action plan has been implemented to address the following
      noncomformity:
    </p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      Please visit the following link to Approve or Reject this ${recordType}’s
      implementation.
    </p>
  `;
}
