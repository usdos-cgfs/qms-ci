const html = String.raw;

export function pendingProblemApprovalTemplate(plan) {
  const recordType = plan.RecordType.Value();
  const problemDescription = plan.ProblemDescription.Value();

  const template = html`
    <p>
      A ${recordType} has been submitted to address the following nonconformity
      and requires approval:
    </p>
    <p>${problemDescription}</p>
    <p>
      Please visit the following link to Approve or Reject this ${recordType}.
    </p>
  `;
  return template;
}
