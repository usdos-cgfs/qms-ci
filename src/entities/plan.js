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
    isRequired: true,
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

  QAO = new PeopleField({
    displayName: "Quality Area Owner",
    isRequired: true,
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

  NextTargetDate = new DateField({
    displayName: "Next Target Date",
  });

  ProblemResolverName = new PeopleField({
    displayName: "CAR/CAP Coordinator",
  });

  Author = new PeopleField({
    displayName: "Submitted By",
  });

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
      "QAO",
      "OFIDescription",
      "DiscoveryDataAnalysis",
      "SubmittedDate",
      "ProblemResolverName",
      "Subject",
      "SelfInitiated",
      "Source",
      "SimilarNoncomformityBool",
      "SimilarNoncomformityDesc",
      "ProcessStage",
      "PreviousStage",
      "NextTargetDate",
      "Author",
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
  };

  static ListDef = {
    name: "CAP_Main",
    title: "CAP_Main",
  };
}
