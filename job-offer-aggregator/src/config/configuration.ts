export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  jobApi: {
    port: parseInt(process.env.PORT, 10) || 3000,
    provider1Address: process.env.PROVIDER1_API_URL,
    provider2Address: process.env.PROVIDER2_API_URL,
  },
  http: {
    fetchTimeout: process.env.FETCH_TIMEOUT ? Number(process.env.FETCH_TIMEOUT) : 10000
  },
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  },
  jobFetcher: {
    provider1Address: process.env.PROVIDER1_API_URL,
    provider2Address: process.env.PROVIDER2_API_URL,
  },
  scheduler: {
    cronSchedule: process.env.CRON_SCHEDULE || '*/15 * * * *',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    schedulerQueue: process.env.SCHEDULER_QUEUE,
    jobFetcherQueue: process.env.JOB_FETCHER_QUEUE,
    jobApiQueue: process.env.JOB_API_QUEUE,
  },
  logLevel: process.env.LOG_LEVEL || 'info'
});

