export class AppError extends Error {
  statusCode;

  constructor(statusCode: number, msg: string) {
    super(msg);

    this.statusCode = statusCode;

    // `captureStackTrace` is a Node built-in function
    Error.captureStackTrace(this, this.constructor);
    //                       ↑     ↑
    //                       |     └─ "Exclude this function and everything below it"
    //                       └─ "Attach the stack trace to THIS object"
  }
}
