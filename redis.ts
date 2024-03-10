import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const client = new Redis(process.env.NODE_ENV === 'test' ? `${process.env.REDIS_URL}` : `${process.env.UPSTASH_REDIS_URL}`);

export default client;