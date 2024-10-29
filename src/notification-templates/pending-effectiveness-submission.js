import { html } from "../constants.js";
import { getAnchorRoleLinkToPlan } from "../services/plan-service.js";

export function pendingEffectivenessSubmissionTemplate(plan) {
  const location = plan.CGFSLocation.Value();
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
    <p>
      For guidance, refer to GFS-RD-QMS-0503 Guidance for CAR/CAP Stage 4 -
      Verification of Effectiveness (<a
        href="http://kbi.cgfs.state.sbu/article.aspx?article=39561&p=28"
        target="_blank"
      >
        KB #39561</a
      >)
    </p>
  `;
}

export function pendingEffectivenessSubmissionRejectedTemplate(
  plan,
  rejection
) {
  const location = plan.CGFSLocation.Value();
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
      Rejection Reason:<br />
      ${rejection.Reason.Value()}
    </p>
    <p>
      When ready, please update proof of effectiveness by navigating to the link
      below.
    </p>
    <p>
      For guidance, refer to GFS-RD-QMS-0503 Guidance for CAR/CAP Stage 4 -
      Verification of Effectiveness (<a
        href="http://kbi.cgfs.state.sbu/article.aspx?article=39561&p=28"
        target="_blank"
      >
        KB #39561</a
      >)
    </p>
  `;
}
