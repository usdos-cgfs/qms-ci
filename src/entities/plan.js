import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "../sal/fields/index.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";

export class Plan extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  Active = new CheckboxField({
    displayName: "Active",
  });

  RecordType = new SelectField({
    displayName: "Record Type",
    options: ["CAR", "CAP"],
    isRequired: true,
  });

  SelfInitiated = new SelectField({
    displayName: "Self Initiated",
    options: ["Yes", "No"],
    isRequired: true,
  });

  Title = new TextField({
    displayName: "Item #",
  });

  static Views = {
    All: ["ID", "Title", "Active", "RecordType", "SelfInitiated"],
  };

  static ListDef = {
    name: "CAP_Main",
    title: "CAP_Main",
  };
}
