import { CheckboxField, SelectField, TextField } from "../sal/fields/index.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";

export const RECORDSOURCETYPES = { CAR: "CAR", CAP: "CAP", BOTH: "BOTH" };

export class RecordSource extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  Title = new TextField({
    displayName: "Title",
  });

  RecordType = new SelectField({
    displayName: "Record Type",
    options: Object.values(RECORDSOURCETYPES),
  });

  SelfInitiated = new CheckboxField({
    displayName: "Self Initiated",
  });

  static Views = {
    All: ["ID", "Title", "RecordType", "SelfInitiated"],
  };

  static ListDef = {
    name: "Record_Sources",
    title: "Record_Sources",
  };
}
