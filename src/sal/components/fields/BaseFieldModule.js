// Hint: use the es6-string-html VS Code module to make template literals easier to read
export const html = String.raw;

export function registerFieldComponents(constructor) {
  ko.components.register(constructor.edit, {
    template: constructor.editTemplate,
    viewModel: constructor,
  });

  ko.components.register(constructor.view, {
    template: constructor.viewTemplate,
    viewModel: constructor,
  });
}

export class BaseFieldModule {
  constructor(params) {
    Object.assign(this, params);
  }

  _id;
  getUniqueId = () => {
    if (!this._id) {
      this._id = "field-" + Math.floor(Math.random() * 10000);
    }
    return this._id;
  };

  Errors = ko.pureComputed(() => {
    if (!this.ShowErrors()) return [];
    if (!this.isRequired) return [];
    return this.Value()
      ? []
      : [
          new ValidationError(
            "text-field",
            "required-field",
            this.displayName + ` is required!`
          ),
        ];
  });

  ShowErrors = ko.observable(false);

  ValidationClass = ko.pureComputed(() => {
    if (!this.ShowErrors()) return;
    return this.Errors().length ? "is-invalid" : "is-valid";
  });

  static viewTemplate = html`
    <div class="fw-semibold" data-bind="text: displayName"></div>
    <div data-bind="text: toString()"></div>
  `;

  static editTemplate = html`<div>Uh oh!</div>`;
}
