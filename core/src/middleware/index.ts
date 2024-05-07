/**
 * Middleware for the application.
 * @module middleware
 * @requires express
 */

import { Request, Response } from 'express';

/**
 * A template for checking the body of a request.
 * @interface CheckTemplate
 */
interface CheckTemplate {
  [ key: string ]: {
    type: string|CheckTemplate;
    optional?: boolean;
  };
}

/**
 * The result of a body check.
 * @interface BodyCheckResult
 * @property {boolean} ok Whether the body is valid.
 * @property {string} [msg] An error message if the body is invalid.
 */
interface BodyCheckResult {
  ok: boolean;
  msg?: string;
}

/**
 * Checks the body of a request against a template.
 * @param body The body of the request.
 * @param template The template to check against.
 * @param path The path to the current object.
 * @returns Whether the body is valid.
 */
const checkBody = (
  body: { [key: string]: any }, 
  template: CheckTemplate, 
  path: string[],
  nested?: boolean
): BodyCheckResult => {
  for (const key in template) {
    console.log(key, template[key])
    if (typeof template[key].type === 'object') {
      const result = checkBody(
        body[key], 
        template[key].type as CheckTemplate,
        path.concat(key),
        nested
      );
      if (!result.ok) return result;
    }
    if (body[key] === undefined && !template[key].optional)
      return { ok: false, msg: `Missing "${path.length ? path.join('.') + '.' : ''}${key}"` };
    if ((typeof body[key] !== template[key].type) && (!template[key].optional || body[key] !== undefined))
      return { ok: false, msg: `Invalid "${path.length ? path.join('.') + '.' : ''}${key}"` };
  }
  return { ok: true }
};

/**
 * Middleware to require a certain type of body in a request.
 * @param body The body to require.
 * @returns The middleware function.
 */
export const requireBody = (body: CheckTemplate) => (req: Request, res: Response, next: () => void): void => {
  const check = checkBody(req.body, body, []);
  if (!check.ok) {
    res.send({ 'success': false, 'msg': check.msg, });
    return;
  }
  next();
};

/**
 * Middleware to require a certain type of query in a request.
 * @param query The query to require.
 * @returns The middleware function.
 */
export const requireQuery = (query: CheckTemplate) => (req: Request, res: Response, next: () => void): void => {
  const check = checkBody(req.query, query, [], false);
  if (!check.ok) {
    res.send({ 'success': false, 'msg': check.msg, });
    return;
  }
  next();
};
