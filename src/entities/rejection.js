import { EFFECTIVENESSREASONS } from "../constants.js";
import {
  CheckboxField,
  DateField,
  dateFieldTypes,
  SelectField,
  TextAreaField,
  TextField,
} from "../sal/fields/index.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";

export class Rejection extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  showEffectivenessReason = ko.pureComputed(() => {
    return this.Stage.Value();
  });

  Title = new TextField({
    displayName: "Plan ID",
    isEditable: false,
  });

  RejectionId = new TextField({
    displayName: "Rejection ID",
    isEditable: false,
  });

  //   EffectivenessReason = new SelectField({
  //     displayName: "Effectiveness Deficiency",
  //     options: Object.values(EFFECTIVENESSREASONS)
  //   })

  Reason = new TextAreaField({
    displayName: "Rejection Reason",
    isRequired: true,
    classList: ["min-w-full"],
  });

  Stage = new TextField({
    displayName: "Stage",
    isEditable: false,
  });

  Rejector = new TextField({
    displayName: "Rejected By",
    isEditable: false,
  });

  Active = new CheckboxField({
    displayName: "Active",
    isEditable: false,
  });

  Created = new DateField({
    displayName: "Rejected On",
    type: dateFieldTypes.datetime,
    isEditable: false,
  });

  Modified = new DateField({
    displayName: "Modified On",
    type: dateFieldTypes.datetime,
    isEditable: false,
  });

  static Views = {
    All: [
      "ID",
      "Title",
      "RejectionId",
      "Reason",
      "Stage",
      "Rejector",
      "Active",
      "Created",
      "Modified",
    ],
    New: ["Title", "RejectionId", "Reason", "Stage", "Rejector", "Active"],
  };

  static ListDef = {
    name: "Rejections",
    title: "Rejections",
  };
}
