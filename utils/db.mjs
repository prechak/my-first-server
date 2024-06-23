import pg from "pg";
const { Pool } = pg;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:std5511pe@localhost:5432/my-blog-app",
});

export default connectionPool;
