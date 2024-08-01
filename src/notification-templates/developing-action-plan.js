import { html } from "../constants";

export function developingActionPlanTemplate(plan) {
  const location = plan.Location.Value();
  const title = plan.Title.Value();
  const recordType = plan.RecordType.Value();

  const isSelfInitiated = plan.SelfInitiated.Value() == "Yes";

  if (isSelfInitiated) {
    return html`
      <p>The following noncomformity has been assigned:</p>
      <ul>
        <li>Location: ${location}</li>
        <li>Record: ${title}</li>
      </ul>
      <p>Please visit the link below to view the noncomformity.</p>
    `;
  }

  const responsiblePerson = plan.CoordinatorName.Value();

  return html`
    <p>The following noncomformity has been assigned:</p>
    <ul>
      <li>Location: ${location}</li>
      <li>Record: ${title}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
    </ul>
    <p>
      You are receiving this email because your QSO has assigned you as the
      responsible party for resolving this ${recordType}.
    </p>
    <p>
      Please visit the link below to view the noncomformity and develop an
      action plan.
    </p>
  `;
}
