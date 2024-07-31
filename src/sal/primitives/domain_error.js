export class DomainError {
  constructor({ source, entity, description }) {
    this.source = source;
    this.entity = entity;
    this.description = description;
  }
}
