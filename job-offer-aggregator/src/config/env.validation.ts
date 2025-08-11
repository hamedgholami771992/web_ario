import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  PROVIDER1_API_URL: Joi.string().uri().required(),
  PROVIDER2_API_URL: Joi.string().uri().required(),

  CRON_SCHEDULE: Joi.string().default('*/15 * * * *'),
  FETCH_TIMEOUT: Joi.number().default(10000),

  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),


  RABBITMQ_URL: Joi.string().uri().required(),
  JOB_FETCHER_QUEUE: Joi.string().required(),
  JOB_API_QUEUE: Joi.string().required(),
  SCHEDULER_QUEUE: Joi.string().required(),
  
});


