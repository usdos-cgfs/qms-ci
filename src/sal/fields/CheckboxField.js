import { BaseField } from "./index.js";
import { CheckboxModule } from "../components/fields/index.js";

export class CheckboxField extends BaseField {
  constructor(params) {
    super(params);
  }

  components = CheckboxModule;
}
