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
import { ConstrainedEntity } from "../sal/primitives/index.js";
import { BusinessOffice, RECORDSOURCETYPES } from "./index.js";
import { appContext } from "../infrastructure/app-db-context.js";

export class Plan extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  isCAP = ko.pureComputed(() => {
    return this.RecordType.Value() == "CAP";
  });

  isCAR = ko.pureComputed(() => {
    return !this.isCAP();
  });

  isSelfInitiatedCAR = ko.pureComputed(() => {
    return this.isCAR() && this.SelfInitiated.Value();
  });

  sourceOptions = ko.pureComputed(() => {
    const recordTypeSources = sourcesStore()?.filter(
      (source) =>
        source.RecordType.Value() == RECORDSOURCETYPES.BOTH ||
        source.RecordType.Value() == this.RecordType.Value()
    );

    if (this.isCAR() && this.SelfInitiated.Value()) {
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
  });

  ProcessStage = new SelectField({
    displayName: "Current Stage",
    options: [],
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
  });

  BusinessOffice = new LookupField({
    displayName: "Business Office",
    type: BusinessOffice,
    options: businessOfficeStore,
    appContext: () => appContext,
  });

  // CGFSLocation

  QSO = new PeopleField({
    displayName: "Quality Segment Owner",
    isRequired: true,
  });

  QAO = new PeopleField({
    displayName: "Quality Area Owner",
    isRequired: true,
  });

  Subject = new TextField({
    displayName: "Subject",
  });

  // CAR

  SelfInitiated = new SelectField({
    displayName: "Self Initiated",
    options: ["Yes", "No"],
    isRequired: true,
    isVisible: this.isCAR,
  });

  ProblemDescription = new TextAreaField({
    displayName: "Problem Description",
    isRequired: this.isCAR,
    isVisible: this.isCAR,
    classList: ["min-w-full"],
  });

  ContainmentAction = new TextAreaField({
    displayName: "Containment Action",
    isRequired: this.isSelfInitiatedCAR,
    isVisible: this.isSelfInitiatedCAR,
    classList: ["min-w-full"],
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
  });

  DiscoveryDataAnalysis = new TextAreaField({
    displayName: "Data, Discovery, and Analysis",
    isRequired: this.isCAP,
    isVisible: this.isCAP,
    classList: ["min-w-full"],
  });

  // Other

  ProblemResolverName = new PeopleField({
    displayName: "CAR/CAP Coordinator",
  });

  SubmittedDate = new DateField({
    displayName: "Submitted On",
  });

  SubmittedBy = new PeopleField({
    displayName: "Submitted By",
  });

  NextTargetDate = new DateField({
    displayName: "Next Target Date",
  });

  static Views = {
    All: [
      "ID",
      "Title",
      "Active",
      "RecordType",
      "SelfInitiated",
      "BusinessOffice",
      "QSO",
      "QAO",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SubmittedDate",
      "SubmittedBy",
      "ProblemResolverName",
      "Subject",
      "SelfInitiated",
      "Source",
      "SimilarNoncomformityBool",
      "SimilarNoncomformityDesc",
      "ProcessStage",
      "PreviousStage",
      "NextTargetDate",
    ],
    New: [
      "RecordType",
      "SelfInitiated",
      "BusinessOffice",
      "QSO",
      "QAO",
      "OFIDescription",
      "DiscoveryDataAnalysis",
    ],
  };

  static ListDef = {
    name: "CAP_Main",
    title: "CAP_Main",
  };
}
