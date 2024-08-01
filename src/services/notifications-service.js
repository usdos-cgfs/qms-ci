import { ROLES } from "../constants.js";
import { Notification } from "../entities/index.js";
import { appContext } from "../infrastructure/app-db-context.js";
import { pendingProblemApprovalTemplate } from "../notification-templates/index.js";
import { getAnchorRoleLinkToPlan } from "./plan-service.js";
import { addTask, finishTask, tasks } from "./tasks-service.js";

const defaultContact = {
  QTM: "CGFSQMSCARCAP@state.gov",
  QTMB: "CGFSQMSBCARCAP@state.gov",
};

const approvedStageNotificationMap = {
  "Pending QTM-B Problem Approval": pendingQtmbProblemApproval,
  "Pending QTM Problem Approval": pendingQtmProblemApproval,
  "Pending QSO Problem Approval": pendingQsoProblemApproval,
  "Pending QAO Problem Approval": pendingQaoProblemApproval,
};

function subjectTemplate(plan, content = null) {
  content = content ?? plan.ProcessStage.toString();
  return `QMS-CAR/CAP - ${content} - ${plan.Title.Value()}`;
}

async function pendingQtmbProblemApproval(plan) {
  const to = [defaultContact.QTMB];

  const subject = subjectTemplate(plan, "Pending QTM-B Problem Approval");
  let body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QTMB);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

async function pendingQtmProblemApproval(plan) {
  const to = [defaultContact.QTM];

  const subject = subjectTemplate(plan);
  const body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QTM);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQsoProblemApproval(plan) {
  const qso = plan.QSO.Value();
  if (!qso) return;
  const to = [qso.Email];

  const subject = subjectTemplate(plan);
  const body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QO);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

function pendingQaoProblemApproval(plan) {
  const qo = plan.QAO.Value();
  if (!qo) return;
  const to = [qo.Email];

  const subject = subjectTemplate(plan);
  const body = pendingProblemApprovalTemplate(plan);
  body += getAnchorRoleLinkToPlan(plan, ROLES.ADMINTYPE.QO);

  return Notification.FromTemplate({
    title: plan.Title.Value(),
    to,
    subject,
    body,
  });
}

export async function stageApprovedNotification(plan, newStage = null) {
  newStage = newStage ?? plan.ProcessStage.Value();
  const notificationFunction = approvedStageNotificationMap[newStage];
  if (!notificationFunction) return;
  const notificationTask = addTask(tasks.notification());
  const folderPath = plan.Title.Value();

  await appContext.Notifications.UpsertFolderPath(folderPath);

  const notification = await notificationFunction(plan);
  if (notification) {
    const result = await appContext.Notifications.AddEntity(
      notification,
      folderPath
    );
  }
  finishTask(notificationTask);
}

export function stageRejected(newStage, plan, rejection) {}
