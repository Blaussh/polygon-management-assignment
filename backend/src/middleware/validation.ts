import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from '../types';

export const validateBody = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      throw new AppError(errorMessage, 400);
    }

    req.body = value;
    next();
  };
};

export const validateParams = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      throw new AppError(errorMessage, 400);
    }

    req.params = value;
    next();
  };
};
