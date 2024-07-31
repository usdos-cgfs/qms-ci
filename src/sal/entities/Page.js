import { Entity } from "../primitives/index.js";

export class Page extends Entity {
  constructor(params) {
    super(params);
  }

  static Views = {
    All: ["ID", "Title", "Created", "Author", "Modified", "Editor"],
  };

  static ListDef = {
    name: "Pages",
    title: "Pages",
  };
}
