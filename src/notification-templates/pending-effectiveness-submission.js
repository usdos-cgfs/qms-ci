import { html } from "../constants.js";
import { getAnchorRoleLinkToPlan } from "../services/plan-service.js";

export function pendingEffectivenessSubmissionTemplate(plan) {
  const location = plan.Location.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();

  return html`
    <p>The following ${recordType}’s implementation has been approved:</p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      When ready, please submit proof of effectiveness by navigating to the link
      below.
    </p>
  `;
}

export function pendingEffectivenessSubmissionRejectedTemplate(plan) {
  const location = plan.Location.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();

  return html`
    <p>
      The following ${recordType}’s implementation has been
      <span style="color: red;">rejected</span>:
    </p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      When ready, please update proof of effectiveness by navigating to the link
      below.
    </p>
  `;
}
