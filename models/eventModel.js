class eventModel {
  constructor(conn) {
    this.conn = conn;
  }

  create() {
    return this.conn.run(`
            CREATE TABLE if not exists events(
                id INTEGER UNIQUE,
                type TEXT,
                actor_id INTEGER,
                repo_id INTEGER,
                created_at date)`);
  }

  all() {
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
            ORDER BY events.id ASC`);
  }

  get(id) {
    return this.conn.get(`SELECT * FROM events WHERE id = ?`, id);
  }

  insert(id, type, actor_id, repo_id, created_at) {
    return this.conn.run(
      `INSERT INTO events (id, type, actor_id, repo_id, created_at) values(?,?,?,?,?)`,
      [id, type, actor_id, repo_id, created_at]
    );
  }

  deleteAll() {
    return this.conn.run(`DELETE FROM events`);
  }

  delete(id) {
    return this.conn.run(`DELETE FROM events WHERE id = ?`, [id]);
  }

  getAllByActorId(id, orderByEventDate) {
    return this.conn.all(
      `
            SELECT
                events.*,
                actors.login,
                actors.avatar_url,
                repos.name,
                repos.url
            FROM events
                INNER JOIN actors ON actors.id = events.actor_id
                LEFT JOIN repos ON repos.id = events.repo_id
            WHERE events.actor_id = ?
            ORDER BY ${
              orderByEventDate ? "events.created_at ASC" : "events.id ASC"
            }`,
      [id]
    );
  }
}

module.exports = eventModel;
