import { TextModule } from "../components/fields/index.js";
import { BaseField } from "./index.js";

// import ValidationError from "../primitives/ValidationError.js";

export class TextField extends BaseField {
  constructor(params) {
    super(params);
    this.attr = params.attr ?? {};
    this.options = params.options ?? null;
  }

  components = TextModule;
}
