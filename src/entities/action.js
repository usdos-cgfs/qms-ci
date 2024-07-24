import {
  DateField,
  PeopleField,
  TextAreaField,
  TextField,
} from "../sal/fields";
import { ConstrainedEntity } from "../sal/primitives";

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

  ExtensionCount = new TextField({
    displayName: "Extension Count",
    isEditable: false,
    attr: {
      type: "number",
    },
  });

  static Views = {
    All: [
      "ID",
      "Title",
      "ActionID",
      "ActionDescription",
      "TargetDate",
      "ActionResponsiblePerson",
      "ExtensionCount",
    ],
  };

  static Listdef = {
    name: "CAP_Actions",
    title: "CAP_Actions",
  };
}
