const sql = require("mssql");
const config = require("@march_ts/build-variant");
const logManager = require("@march_ts/log-manager");

const poolLog = new sql.ConnectionPool(config.configSql, error => {
    if (error !== null) console.log("connect to log db error: ", error);
});

class SQLManager {
    constructor() {}

    async executeStore(store, storeParams) {
        let startDate = new Date();
        // console.log("executing store:", store);
        await poolLog;
        let request = new sql.Request(poolLog);
        if (storeParams) {
            storeParams.forEach(param => {
                request.input(
                    param.name,
                    param.type || sql.NVarChar,
                    param.value
                );
            });
        }
        let result = await request.execute(store);
        // console.log("executed store:", store);

        logManager.insertDBLog(
            store,
            storeParams,
            result.recordsets,
            config.configSql,
            new Date() - startDate
        );
        return result;
    }
}
const sqlManager = new SQLManager();
module.exports = sqlManager;
