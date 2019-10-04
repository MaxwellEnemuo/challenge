const sqlite = require('sqlite3');
const Promise = require('bluebird');

Promise.config({
    cancellation : true
})

class Conn {
    
    constructor(dbPath) {
        
        this.db = new sqlite.Database(dbPath, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE , (err) => {
            if (err) {
                return err;
            }
        });
    }
    
    run(sql, params = []) {
        
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, err => err ? reject(err) : resolve());
        });
    }
    
    get(sql, params = []){
        
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => (err) ? reject(err) : resolve(row));
        });
    }
    
    all(sql, params = []) {
        
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.log('err sql', sql);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = Conn;