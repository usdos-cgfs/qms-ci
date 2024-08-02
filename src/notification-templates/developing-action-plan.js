import { html } from "../constants.js";
import { getAnchorRoleLinkToPlan } from "../services/plan-service.js";

export function developingActionPlanTemplate(plan) {
  const location = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();

  const isSelfInitiated = plan.SelfInitiated.Value() == "Yes";

  if (isSelfInitiated) {
    return html`
      <p>The following noncomformity has been assigned:</p>
      <ul>
        <li>Record: ${title}</li>
        <li>Location: ${location}</li>
      </ul>
      <p>Please visit the link below to view the noncomformity.</p>
    `;
  }

  return html`
    <p>The following noncomformity has been assigned:</p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location}</li>
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

export function developingActionPlanRejectedTemplate(plan, rejection) {
  const location = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan);
  const recordType = plan.RecordType.Value();
  const responsiblePerson = plan.CoordinatorName.Value();

  return html`
    <p>The following plan has been <span style="color: red">rejected</span>:</p>
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
      You are receiving this email because you are designated as the responsible
      party for resolving this ${recordType}.
    </p>
    <p>
      Please visit the link below to view the noncomformity and revise the
      action plan.
    </p>
  `;
}
