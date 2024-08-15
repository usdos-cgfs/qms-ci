import { html } from "../constants.js";
import { getAnchorRoleLinkToPlan } from "../services/plan-service.js";

export function pendingEffectivenessApprovalTemplate(plan, role) {
  const location = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan, role);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();

  return html`
    <p>
      Proof of effectiveness has been submitted for the following ${recordType}:
    </p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      Please visit the following link to Approve or Reject this ${recordType}’s
      effectiveness.
    </p>
  `;
}
