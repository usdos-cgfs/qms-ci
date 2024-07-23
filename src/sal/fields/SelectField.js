import {
  SearchSelectModule,
  SelectModule,
} from "../components/fields/index.js";
import { BaseField } from "./index.js";

export class SelectField extends BaseField {
  constructor({
    displayName,
    isRequired = false,
    isVisible,
    options,
    multiple = false,
    optionsText,
    instructions,
    defaultValue,
  }) {
    super({ isVisible, displayName, isRequired, instructions, defaultValue });
    this._options = options;

    this.Options = ko.pureComputed(() => {
      return ko.unwrap(options);
    });

    this.multiple = multiple;
    this.Value = multiple ? ko.observableArray() : ko.observable();
    this.optionsText = optionsText;

    this.components = this.multiple ? SearchSelectModule : SelectModule;
  }

  toString = ko.pureComputed(() =>
    this.multiple ? this.Value().join(", ") : this.Value()
  );

  get = () => this.Value();

  set = (val) => {
    if (val && this.multiple) {
      if (Array.isArray(val)) {
        this.Value(val);
      } else {
        this.Value(val.results ?? val.split(";#"));
      }
      return;
    }
    this.Value(val);
  };

  // Options = ko.observableArray();
}
