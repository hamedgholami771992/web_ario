export interface EnvironmentVarTypes {
  nodeEnv: 'development' | 'production' | 'test';
  jobApi: {
    port: number;
    provider1Address: string;
    provider2Address: string;

  }
  http: {
    fetchTimeout: number;
  }

  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };

  jobFetcher: {
    provider1Address: string;
    provider2Address: string;
  };
  scheduler: {
    cronSchedule: string;
  };

  rabbitmq: { 
    url: string; 
    schedulerQueue: string,
    jobFetcherQueue: string,
    jobApiQueue: string,
  };

  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
