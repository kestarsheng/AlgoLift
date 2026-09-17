// 读取并校验后端运行所需的环境变量。
import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  databaseUrl: string;
  jwtSecret: string;
  port: number;
  frontendUrl: string;
}

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const config: AppConfig = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173'
};
