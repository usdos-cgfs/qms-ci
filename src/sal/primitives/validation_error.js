export class ValidationError {
  constructor(source, type, description) {
    this.source = source;
    this.type = type;
    this.description = description;
  }
}
