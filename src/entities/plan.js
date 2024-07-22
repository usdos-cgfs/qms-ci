import { businessOfficeStore } from "../infrastructure/store.js";
import {
  CheckboxField,
  PeopleField,
  SelectField,
  TextAreaField,
  TextField,
  DateField,
  LookupField,
} from "../sal/fields/index.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";
import { BusinessOffice } from "./index.js";
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

  Active = new CheckboxField({
    displayName: "Active",
  });

  RecordType = new SelectField({
    displayName: "Record Type",
    options: ["CAR", "CAP"],
    isRequired: true,
  });

  //   Source = new SelectField({
  //     displayName: "Source",
  //     options: ko.pureComputed(() => {

  //     })
  //   })

  SelfInitiated = new SelectField({
    displayName: "Self Initiated",
    options: ["Yes", "No"],
    isRequired: true,
  });

  Title = new TextField({
    displayName: "Item #",
  });

  Subject = new TextField({
    displayName: "Subject",
  });

  ProcessStage = new SelectField({
    displayName: "Current Stage",
    options: [],
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
  };

  static ListDef = {
    name: "CAP_Main",
    title: "CAP_Main",
  };
}
