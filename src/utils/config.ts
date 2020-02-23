interface EnvConfig {
  DATABASE_URL?: string;
}

const defaults: EnvConfig = {
  DATABASE_URL: '',
};

export const config: EnvConfig = Object.assign(defaults, process.env);
