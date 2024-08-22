import { ACTIONSTATES } from "../constants.js";
import {
  DateField,
  PeopleField,
  SelectField,
  TextAreaField,
  TextField,
} from "../sal/fields/index.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";

export class Action extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  Title = new TextField({
    displayName: "Plan #",
    isEditable: false,
  });

  ActionID = new TextField({
    displayName: "Action ID",
    isEditable: false,
  });

  ActionDescription = new TextAreaField({
    displayName: "Action Description",
    isRequired: true,
    isRichText: true,
    classList: ["min-w-full"],
  });

  TargetDate = new DateField({
    displayName: "Target Date",
    isRequired: true,
  });

  ActionResponsiblePerson = new PeopleField({
    displayName: "Action Responsible Person",
    isRequired: true,
  });

  RevisionCount = new TextField({
    displayName: "Revision Count",
    isEditable: false,
    attr: {
      type: "number",
    },
  });

  ImplementationStatus = new SelectField({
    displayName: "Status",
    options: Object.values(ACTIONSTATES),
    isEditable: false,
  });

  ImplementationDate = new DateField({
    displayName: "Implementation Date",
    isEditable: false,
  });

  static Views = {
    All: [
      "ID",
      "Title",
      "ActionID",
      "ActionDescription",
      "TargetDate",
      "ActionResponsiblePerson",
      "RevisionCount",
      "ImplementationStatus",
      "ImplementationDate",
    ],
    New: [
      "ActionID",
      "ActionDescription",
      "TargetDate",
      "ActionResponsiblePerson",
    ],
    Edit: [
      "ActionDescription",
      "TargetDate",
      "ActionResponsiblePerson",
      "RevisionCount",
      "ImplementationStatus",
    ],
  };

  static ListDef = {
    name: "CAP_Actions",
    title: "CAP_Actions",
  };
}
