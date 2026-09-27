// 读取并校验后端运行所需的环境变量。
import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  databaseUrl: string;
  jwtSecret: string;
  port: number;
  frontendOrigins: string[];
}

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

/** 解析 FRONTEND_URL（支持逗号分隔多源），返回归一化后的来源白名单。 */
const parseFrontendOrigins = (value: string | undefined): string[] => {
  const raw = (value ?? 'http://localhost:5173').split(',').map((item) => item.trim()).filter(Boolean);
  const normalized = new Set<string>();
  for (const origin of raw) {
    try { normalized.add(new URL(origin).origin); } catch { normalized.add(origin); }
  }
  return Array.from(normalized);
};

export const config: AppConfig = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  port: Number(process.env.PORT ?? 3000),
  frontendOrigins: parseFrontendOrigins(process.env.FRONTEND_URL)
};
