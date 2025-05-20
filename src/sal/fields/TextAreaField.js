import { TextAreaModule } from "../components/fields/index.js";
import { BaseField } from "./BaseField.js";

export class TextAreaField extends BaseField {
  constructor(params) {
    super(params);
    this.isRichText = params.isRichText;
    this.attr = params.attr ?? {};
  }

  components = TextAreaModule;
}
