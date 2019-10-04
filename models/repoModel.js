class repoModel {
    
    constructor(conn) {
        this.conn = conn;
    }
    
    create() {

        return this.conn.run(`
            CREATE TABLE if not exists repos(
                id INTEGER UNIQUE,
                name TEXT,
                url TEXT)`);
    }
    
    all() {
        
        return this.conn.all(`SELECT * FROM repos`);
    }
    
    get(id) {
        
        return this.conn.get(`SELECT * FROM repos WHERE id = ?`, id);
    }
    
    insert(id, name, url) {
        
        return this.conn.run(
            `INSERT INTO repos (id, name, url) values(?,?,?)`,
            [id, name, url]);
    }
    
    deleteAll() {
        
        return this.conn.run(`DELETE FROM repos`);
    }
    
    delete(id){
        
        return this.conn.run(`DELETE FROM repos WHERE id = ?`,[id]);
    }
}

module.exports = repoModel;