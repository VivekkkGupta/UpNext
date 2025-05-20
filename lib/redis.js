import { createClient } from "redis";

const redisOption = {
    url: "redis://127.0.0.1:6379",
};

const redisclient = createClient(redisOption);

redisclient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

if (!redisclient.isOpen) {
    await redisclient.connect();
}

export default redisclient;