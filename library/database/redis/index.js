import redis from "redis";
import configs from "../../../config"

const client = redis.createClient({
    host: configs.redis.host,
    port: configs.redis.port,
    db: configs.redis.database,
    socket_keepalive: true,
    prefix: configs.redis.prefix
});

client.on("connect", function () {
    console.log(`Connect Success To Redis`);
});

module.exports = client;
