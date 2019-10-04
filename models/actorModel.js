class actorModel {
    
    constructor(conn) {
        this.conn = conn;
    }
    
    create() {

        return this.conn.run(`
            CREATE TABLE if not exists actors(
                id INTEGER UNIQUE,
                login TEXT,
                avatar_url TEXT)`);
    }
    
    all() {
        
        return this.conn.all(`SELECT * FROM actors`);
    }
    
    get(id) {
        
        return this.conn.get(`SELECT * FROM actors WHERE id = ?`, id);
    }
    
    insert(id, login, avatar_url) {
        
        return this.conn.run(
            `INSERT INTO actors (id, login, avatar_url) values(?,?,?)`,
            [id, login, avatar_url]);
    }
    
    deleteAll() {
        
        return this.conn.run(`DELETE FROM actors`);
    }
    
    delete(id){
        
        return this.conn.run(`DELETE FROM actors WHERE id = ?`,[id]);
    }
    
    update(id, login, avatar_url) {
        return this.conn.run(`
            UPDATE actors SET login = ?, avatar_url = ?
            WHERE id = ?`, [login, avatar_url, id]);
    }
    
    getAllWithMostEvents() {
        
        return this.conn.all(`
            SELECT
                actors.id,
                actors.login,
                actors.avatar_url,
                count(events.id)
            FROM actors
            INNER JOIN events where events.actor_id = actors.id
            GROUP BY actors.id, actors.login, actors.avatar_url
            ORDER BY
                count(events.id) DESC,
                events.created_at DESC,
                actors.login ASC
        `);
    }
    
    count() {
        
        return this.conn.get(`SELECT count(actors.id) as num_actors FROM actors`);
    }
    
    getAllId() {
        
        return this.conn.all(`SELECT id FROM actors`);
    }
    
    createTemp() {

        return this.conn.run(`
            CREATE TABLE if not exists temp_actors(
                id INTEGER UNIQUE,
                login TEXT,
                avatar_url TEXT,
                max_streak INTEGER,
                last_event date)`);
    }
    
    getAllEventsActors() {
        
        return this.conn.all(`
            SELECT
                events.*,
                actors.login,
                actors.avatar_url,
                repos.name,
                repos.url
            FROM events
                LEFT JOIN actors ON actors.id = events.actor_id
                LEFT JOIN repos ON repos.id = events.repo_id
            ORDER BY events.actor_id ASC`);
    }
    
    insertTempStreak(id, login, avatar_url, max_streak, last_event) {
        
        return this.conn.run(
            `INSERT INTO temp_actors(id, login, avatar_url, max_streak, last_event) values(?,?,?,?,?)`,
            [id, login, avatar_url, max_streak, last_event]);
    }
    
    getAllStreaks() {
        return this.conn.all(`
            SELECT * FROM temp_actors
            ORDER BY max_streak DESC, last_event DESC, login ASC
        `);
    }
}

module.exports = actorModel;