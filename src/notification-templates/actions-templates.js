import { html, ROLES } from "../constants.js";
import { getAnchorRoleLinkToPlan } from "../services/plan-service.js";

export function actionRequiresQsoApprovalTemplate(plan, action) {
  const location = plan.CGFSLocation.Value();
  const title = getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QO);
  const recordType = ko.unwrap(plan.RecordType.Value);
  const responsiblePerson = plan.CoordinatorName.Value();
  const qso = ko.unwrap(plan.QSO.Value);

  return html`
    <p>
      Action
      <span style="font-weight: bold;"
        >${ko.unwrap(action.ActionID.Value)}</span
      >
      on the following ${recordType} has been edited and requires the QSO's
      approval.
    </p>
    <ul>
      <li>Record: ${title}</li>
      <li>Location: ${location}</li>
      <li>CAR/CAP Coordinator: ${responsiblePerson}</li>
      <li>QSO: ${qso.Title}</li>
    </ul>
    <p>Please visit the following link to Approve or Reject this Action.</p>
  `;
}
