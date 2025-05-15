export class Result {
  constructor(value) {
    this.value = value;
  }

  value;
  error;

  get isSuccess() {
    return !this.error;
  }

  get isFailure() {
    return !this.isSuccess;
  }

  static Success(value) {
    return new Result(value);
  }

  static Failure(error) {
    const result = new Result();
    result.error = error;
    return result;
  }
}
