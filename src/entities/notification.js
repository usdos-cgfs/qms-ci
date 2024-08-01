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

  Title = new TextField({
    displayName: "Subject",
    isRequired: true,
  });

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

  Subject = new TextField({
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

  static FromTemplate({ title, to, cc = null, bcc = null, subject, body }) {
    const notification = new Notification();
    notification.Title.Value(title);
    notification.To.Value(to.join(";"));
    notification.CC.Value(cc?.join(";"));
    notification.BCC.Value(bcc?.join(";"));
    notification.Subject.Value(subject);
    notification.Body.Value(body);
    return notification;
  }

  static Views = {
    All: ["To", "CC", "BCC", "Title", "Subject", "Body", "Sent"],
  };

  static ListDef = {
    name: "Notifications",
    title: "Notifications",
  };
}
