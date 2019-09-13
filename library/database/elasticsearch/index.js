import * as elasticsearch from "@elastic/elasticsearch";
import configs from "../../../config";

module.exports = new elasticsearch.Client({
    node: `http://${configs.es.host}:${configs.es.port}`
});

