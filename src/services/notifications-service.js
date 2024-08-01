import { Notification } from "../entities/index.js";
import { appContext } from "../infrastructure/app-db-context.js";
import { pendingProblemApprovalTemplate } from "../notification-templates/index.js";

const defaultContact = {
  QTM: "CGFSQMSCARCAP@state.gov",
  QTMB: "CGFSQMSBCARCAP@state.gov",
};

const approvedStageNotificationMap = {
  "Pending QTM-B Problem Approval": pendingQtmbProblemApproval,
};

function subjectTemplate(plan, content) {
  return `QMS-CAR/CAP - ${content} - ${plan.Title.Value()}`;
}

async function pendingQtmbProblemApproval(plan) {
  const to = [defaultContact.QTMB];

  const subject = subjectTemplate(plan, "Pending QTM-B Problem Approval");
  const body = pendingProblemApprovalTemplate(plan);

  const notification = Notification.FromTemplate({ to, subject, body });

  const result = await appContext.Notifications.AddEntity(notification);
}

export async function stageApprovedNotification(plan, newStage = null) {
  newStage = newStage ?? plan.ProcessStage.Value();
  await approvedStageNotificationMap[newStage](plan);
}

export function stageRejected(newStage, plan, rejection) {}
