import { TextAreaField, TextField } from "../sal/fields";
import { ConstrainedEntity } from "../sal/primitives/index.js";

export class RootCauseWhy extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  Title = new TextField({
    displayName: "Title",
    isEditable: false,
  });

  Number = new TextField({
    displayName: "Number",
    isEditable: false,
  });

  Question = new TextAreaField({
    displayName: "Question",
    isRequired: true,
  });

  Answer = new TextAreaField({
    displayName: "Answer",
    isRequired: true,
  });

  static Views = {
    All: ["ID", "Title", "Number", "Question", "Answer"],
  };

  static ListDef = {
    name: "Root_Cause_Why",
    title: "Root_Cause_Why",
  };
}
