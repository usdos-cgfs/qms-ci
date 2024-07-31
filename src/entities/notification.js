import {
  DateField,
  dateFieldTypes,
  PeopleField,
  SelectField,
  TextAreaField,
  TextField,
} from "../sal/fields/index.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";

export class Notification extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  To = new TextField({
    displayName: "To",
    isRequired: true,
  });

  CC = new TextField({
    displayName: "To",
    isRequired: true,
  });

  BCC = new TextField({
    displayName: "To",
    isRequired: true,
  });

  Title = new TextField({
    displayName: "Subject",
    isRequired: true,
  });

  Body = new TextAreaField({
    displayName: "Body",
    isRequired: true,
    isRichText: true,
  });

  Sent = new DateField({
    displayName: "Sent On",
    type: dateFieldTypes.datetime,
  });

  static Views = {
    All: ["To", "CC", "BCC", "Title", "Body", "Sent"],
  };

  static ListDef = {
    name: "Notifications",
    title: "Notifications",
  };
}
