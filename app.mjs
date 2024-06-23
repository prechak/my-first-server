import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/posts", async (req, res) => {
  let result;
  try {
    result = await connectionPool.query(`select * from posts`);
  } catch {
    return res.status(500).json({
      message: "Server could not read post because database connection",
    });
  }

  return res.status(200).json({
    data: result.rows,
  });
});

app.get("/posts/:postId", async (req, res) => {
  //1) access parameder
  const postIdFromClient = req.params.postId;
  //2) query
  const result = await connectionPool.query(
    `select * from posts where post_id=$1`,
    [postIdFromClient]
  );
  // ถ้าไม่มีข้อมูล
  if (!result.rows[0]) {
    return res.status(404).json({
      message: `Server cound not find a requset post (post id: ${postIdFromClient})`,
    });
  }

  //3) return response
  return res.status(200).json({
    data: result.rows[0],
  });
});

app.post("/posts", async (req, res) => {
  // logic in database
  // 1 access ข้อมูล
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };

  // 2 query
  await connectionPool.query(
    `insert into posts (user_id, title, content, category, length, created_at, updated_at, published_at, status) 
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      1, // นี่คือ user_id ที่ถูกจำลองขึ้นมา เนื่องจากเรายังไม่มีระบบ Authentication ในส่วน Back End
      newPost.title,
      newPost.content,
      newPost.category,
      newPost.length,
      newPost.created_at,
      newPost.updated_at,
      newPost.published_at,
      newPost.status,
    ]
  );

  return res.status(201).json({
    message: "Created post successfully",
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
