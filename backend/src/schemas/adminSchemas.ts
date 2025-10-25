import Joi from 'joi';

export const adminLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const deviceVerificationSchema = Joi.object({
  deviceId: Joi.string().required(),
});

// Alternative schema for route parameters
export const deviceVerificationParamsSchema = Joi.object({
  deviceId: Joi.string().required(),
});
