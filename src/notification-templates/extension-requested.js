import { html } from "../constants.js";

export function extensionRequestedTemplate(plan) {
  const location = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();

  return html`
    <p>An extension has been requested for the following action plan has:</p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
      <li>Extension Count: ${plan.ExtensionCount.Value()}</li>
    </ul>
    <p>Please visit the CAP/CAR tool to view and complete your actions.</p>
  `;
}
