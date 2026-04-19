export class AppError extends Error {
  statusCode;
  isOperational;

  constructor(statusCode: number, msg: string) {
    super(msg);

    this.statusCode = statusCode;
    this.isOperational = true;

    // `captureStackTrace` is a Node built-in function
    Error.captureStackTrace(this, this.constructor);
    //                       ↑     ↑
    //                       |     └─ "Exclude this function and everything below it"
    //                       └─ "Attach the stack trace to THIS object"
  }
}
