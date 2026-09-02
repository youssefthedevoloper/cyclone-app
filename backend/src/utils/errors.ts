export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, message: string, code = 'error') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFound(msg = 'Not found') {
  return new ApiError(404, msg, 'not_found');
}
export function badRequest(msg: string) {
  return new ApiError(400, msg, 'bad_request');
}
export function unauthorized(msg = 'Unauthorized') {
  return new ApiError(401, msg, 'unauthorized');
}
export function forbidden(msg = 'Forbidden') {
  return new ApiError(403, msg, 'forbidden');
}
export function conflict(msg: string) {
  return new ApiError(409, msg, 'conflict');
}
