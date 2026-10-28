import { createClient } from "redis"
import { REDIS_URI } from "../../config/config.service.js";

export const redis_client = createClient({
  url: REDIS_URI
});

export async function connectRedis() {
    try {
        await redis_client.connect();
        console.log("redis connected successfully");
        
    } catch (error) {
        console.log("redis fail to connect");
        
    }
} 