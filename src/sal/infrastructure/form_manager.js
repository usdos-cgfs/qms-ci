import { DefaultForm } from "../components/forms/index.js";
import { FieldDisplayModes } from "../enums/display_modes.js";

export function NewForm(entity, view = null) {
  return new DefaultForm({ entity, view, displayMode: FieldDisplayModes.new });
}

export function EditForm(entity, view = null) {
  return new DefaultForm({ entity, view, displayMode: FieldDisplayModes.edit });
}

export function DispForm(entity, view = null) {
  return new DefaultForm({ entity, view, displayMode: FieldDisplayModes.view });
}
