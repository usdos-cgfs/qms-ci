import { businessOfficeStore, sourcesStore } from "../infrastructure/store.js";
import {
  CheckboxField,
  PeopleField,
  SelectField,
  TextAreaField,
  TextField,
  DateField,
  LookupField,
  dateFieldTypes,
} from "../sal/fields/index.js";
import { PLANTYPE, LOCATION } from "../constants.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";
import { BusinessOffice, RECORDSOURCETYPES } from "./index.js";
import { appContext } from "../infrastructure/app-db-context.js";

export class Plan extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  isCAP = ko.pureComputed(() => {
    return ko.unwrap(this.RecordType.Value) == PLANTYPE.CAP;
  });

  isCAR = ko.pureComputed(() => {
    return ko.unwrap(this.RecordType.Value) == PLANTYPE.CAR;
  });

  isSelfInitiated = ko.pureComputed(() => {
    return ko.unwrap(this.SelfInitiated.Value) == "Yes";
  });

  isSelfInitiatedCAR = ko.pureComputed(() => {
    return (
      ko.unwrap(this.RecordType.Value) == PLANTYPE.CAR &&
      ko.unwrap(this.SelfInitiated.Value) == "Yes"
    );
  });

  sourceOptions = ko.pureComputed(() => {
    let recordTypeSources = sourcesStore()?.filter(
      (source) =>
        source.RecordType.Value() == RECORDSOURCETYPES.BOTH ||
        source.RecordType.Value() == this.RecordType.Value()
    );

    if (this.isSelfInitiatedCAR()) {
      recordTypeSources = recordTypeSources.filter(
        (source) => source.SelfInitiated.Value() == this.SelfInitiated.Value()
      );
    }

    return recordTypeSources.map((source) => source.Title.toString());
  });

  Active = new CheckboxField({
    displayName: "Active",
  });

  Title = new TextField({
    displayName: "Item #",
    isEditable: false,
  });

  // NEW FORM

  RecordType = new SelectField({
    displayName: "Record Type",
    options: ["CAR", "CAP"],
    isRequired: true,
  });

  Source = new SelectField({
    displayName: "Source",
    options: this.sourceOptions,
    isRequired: true,
    classList: ["min-w-full"],
  });

  BusinessOffice = new LookupField({
    displayName: "Business Office",
    type: BusinessOffice,
    options: businessOfficeStore,
    appContext: () => appContext,
    isRequired: true,
  });

  CGFSLocation = new SelectField({
    displayName: "Location",
    options: Object.values(LOCATION),
    isRequired: true,
  });

  QSO = new PeopleField({
    displayName: "Quality Segment Owner",
    isRequired: true,
  });

  QSOName = new TextField({
    displayName: "QSO Name",
    isVisible: true,
    isEditable: false,
  });

  QAO = new PeopleField({
    displayName: "Quality Area Owner",
    isRequired: true,
  });

  QAOName = new TextField({
    displayName: "QAO Name",
    isVisible: true,
    isEditable: false,
  });

  Subject = new TextField({
    displayName: "Subject",
    isRequired: true,
    classList: ["min-w-full"],
  });

  // CAR

  SelfInitiated = new SelectField({
    displayName: "Self Initiated",
    options: ["Yes", "No"],
    defaultValue: "Yes",
    instructions: "Are you opening this on behalf of your own business office?",
    isRequired: this.isCAR,
    isVisible: this.isCAR,
  });

  ProblemDescription = new TextAreaField({
    displayName: "Problem Description",
    isRequired: this.isCAR,
    isVisible: this.isCAR,
    classList: ["min-w-full"],
    isRichText: true,
  });

  ContainmentAction = new TextAreaField({
    displayName: "Containment Action",
    isRequired: this.isSelfInitiatedCAR,
    isVisible: this.isSelfInitiatedCAR,
    classList: ["min-w-full"],
    isRichText: true,
  });

  ContainmentActionDate = new DateField({
    displayName: "Containment Action Date",
    isRequired: this.isSelfInitiatedCAR,
    isVisible: this.isSelfInitiatedCAR,
    type: dateFieldTypes.date,
  });

  // CAP

  OFIDescription = new TextAreaField({
    displayName: "Opportunity for Improvement",
    isRequired: this.isCAP,
    isVisible: this.isCAP,
    classList: ["min-w-full"],
    isRichText: true,
  });

  DiscoveryDataAnalysis = new TextAreaField({
    displayName: "Data, Discovery, and Analysis",
    isRequired: this.isCAP,
    isVisible: this.isCAP,
    classList: ["min-w-full"],
    isRichText: true,
  });

  // Other

  SubmittedDate = new DateField({
    displayName: "Submitted On",
  });

  ProcessStage = new SelectField({
    displayName: "Status",
  });

  PreviousStage = new TextField({
    displayName: "Previous Stage",
    isVisible: false,
    isEditable: false,
  });

  NextTargetDate = new DateField({
    displayName: "Next Target Date",
  });

  ProblemResolverName = new PeopleField({
    displayName: "CAR/CAP Coordinator",
  });

  CoordinatorName = new TextField({
    displayName: "CAR/CAP Coordinator Name",
    isVisible: true,
    isEditable: false,
  });

  CloseDate = new DateField({
    displayName: "Closed On",
    type: dateFieldTypes.datetime,
  });

  CancelReason = new TextAreaField({
    displayName: "Cancellation Reason",
    instructions: "Please provide a reason for cancelling this plan.",
    isRichText: true,
    classList: ["min-w-full"],
    isRequired: true,
  });

  ExtensionCount = new TextField({
    displayName: "Extension Count",
  });

  ImplementationTargetDate = new DateField({
    displayName: "Implementation Target Date",
  });

  QSOImplementAdjudicationDate = new DateField({
    displayName: "QSO Implementation Adjudication Date",
  });

  EffectivenessVerificationTargetD = new DateField({
    displayName: "Effectiveness Verification Target Date",
  });

  Author = new PeopleField({
    displayName: "Submitted By",
  });

  AuthorName = new TextField({
    displayName: "Submitted By Name",
    isVisible: true,
    isEditable: false,
  });

  flatten() {
    const plan = this;
    console.log("Flattening Plan: ", plan.Title.Value());

    const coordinatorName = ko.unwrap(plan.ProblemResolverName.Value)?.Title;
    plan.CoordinatorName.Value(coordinatorName);

    const qaoName = ko.unwrap(plan.QAO.Value)?.Title;
    plan.QAOName.Value(qaoName);

    const qsoName = ko.unwrap(plan.QSO.Value)?.Title;
    plan.QSOName.Value(qsoName);

    const authorName = ko.unwrap(plan.Author.Value)?.Title;
    plan.AuthorName.Value(authorName);
  }

  static Views = {
    All: [
      "ID",
      "Title",
      "Active",
      "RecordType",
      "SelfInitiated",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QSOName",
      "QAO",
      "QAOName",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SubmittedDate",
      "ProblemResolverName",
      "CoordinatorName",
      "Subject",
      "SelfInitiated",
      "Source",
      "SimilarNoncomformityBool",
      "SimilarNoncomformityDesc",
      "ProcessStage",
      "PreviousStage",
      "NextTargetDate",
      "ExtensionCount",
      "ImplementationTargetDate",
      "QSOImplementAdjudicationDate",
      "EffectivenessVerificationTargetD",
      "CancelReason",
      "CloseDate",
      "Author",
      "AuthorName",
    ],
    View: [
      "Title",
      "Active",
      "RecordType",
      "SelfInitiated",
      "BusinessOffice",
      "CGFSLocation",
      "QSOName",
      "QAOName",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SubmittedDate",
      "CoordinatorName",
      "Subject",
      "SelfInitiated",
      "Source",
      "SimilarNoncomformityBool",
      "SimilarNoncomformityDesc",
      "ProcessStage",
      "PreviousStage",
      "NextTargetDate",
      "AuthorName",
    ],
    New: [
      "RecordType",
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QAO",
      "Subject",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SelfInitiated",
      "ProblemDescription",
      "ContainmentAction",
      "ContainmentActionDate",
    ],
    QTMEditForm: [
      "Title",
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QAO",
      "Subject",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SelfInitiated",
      "ProblemDescription",
      "ContainmentAction",
      "ContainmentActionDate",
      "ProblemResolverName",
    ],
    QTMEditSubmit: [
      "Title",
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QSOName",
      "QAO",
      "QAOName",
      "Subject",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SelfInitiated",
      "ProblemDescription",
      "ContainmentAction",
      "ContainmentActionDate",
      "ProblemResolverName",
      "CoordinatorName",
    ],
    SubmitterEditForm: [
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QAO",
      "ProblemDescription",
    ],
    SubmitterEditSubmit: [
      "Source",
      "BusinessOffice",
      "CGFSLocation",
      "QSO",
      "QSOName",
      "QAO",
      "QAOName",
      "ProblemDescription",
    ],
    Cancel: ["CancelReason"],
    CancelSubmit: [
      "Active",
      "CancelReason",
      "ProcessStage",
      "CloseDate",
      "PreviousStage",
    ],
  };

  static ListDef = {
    name: "CAP_Main",
    title: "CAP_Main",
  };
}
