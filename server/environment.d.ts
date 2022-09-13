declare namespace NodeJS {
  export interface ProcessEnv {
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
  }
}
