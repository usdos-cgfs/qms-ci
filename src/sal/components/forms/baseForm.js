import * as ko from "knockout";
export const html = String.raw;

export class BaseForm {
  constructor({ entity = null, view = null }) {
    this.entity = entity;
    this.view = view ?? entity.constructor.Views.All;
  }

  saving = ko.observable(false);

  FormFields = ko.pureComputed(() => {
    const entity = ko.utils.unwrapObservable(this.entity);
    const fields = this.view
      .map((key) => entity.FieldMap[key])
      .filter((field) => field && ko.unwrap(field.Visible));
    return fields;
  });

  // Validate just the fields on this form
  validate = (showErrors = true) => {
    Object.values(this.FormFields()).map(
      (field) => field?.validate && field.validate(showErrors)
    );
    this.ShowErrors(showErrors);
    return this.Errors();
  };

  ShowErrors = ko.observable(false);

  Errors = ko.pureComputed(() => {
    return Object.values(this.FormFields())
      .filter((field) => field?.Errors && field.Errors())
      .flatMap((field) => field.Errors());
  });

  IsValid = ko.pureComputed(() => !this.Errors().length);

  params = this;
}
