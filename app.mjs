import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4000;

app.use(express.json());

// app.get("/posts", async (req, res) => {
//   let result;
//   try {
//     result = await connectionPool.query(`select * from posts`);
//   } catch {
//     return res.status(500).json({
//       message: "Server could not read post because database connection",
//     });
//   }

//   return res.status(200).json({
//     data: result.rows,
//   });
// });

// query by category and length

app.get("/posts", async (req, res) => {
  let results;
  // 1) Access query parameter ที่ client แนบมากับ HTTP Endpoint
  const category = req.query.category;
  const length = req.query.length;

  try {
    // 2) เขียน query เพื่ออ่านข้อมูลโพสต์ ด้วย connection pool
    results = await connectionPool.query(
      `
      SELECT * FROM posts
      WHERE
      (category = $1 OR $1 IS NULL OR $1 = '')
      AND
      (length = $2 OR $2 IS NULL OR $2 = '')
      `,
      [category, length]
    );
  } catch (error) {
    // Added error parameter to catch block
    return res.status(500).json({
      message: "Server could not read post because of a database issue",
    });
  }

  // 3) Success query
  return res.status(200).json({
    data: results.rows,
  });
});

app.get("/posts/:postId", async (req, res) => {
  //1) access parameter
  const postIdFromClient = req.params.postId;
  //2) query
  const result = await connectionPool.query(
    `select * from posts where post_id=$1`,
    [postIdFromClient]
  );
  // ถ้าไม่มีข้อมูล
  if (!result.rows[0]) {
    return res.status(404).json({
      message: `Server couสnd not find a requset post (post id: ${postIdFromClient})`,
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

app.put("/posts/:postId", async (req, res) => {
  try {
    //1 access endpoint parameter
    const postIdFromClient = req.params.postId;
    const updatedPost = { ...req.body, updated_at: new Date() };

    //2 เขียน query
    await connectionPool.query(
      `
      update posts
      set title = $2,
          content = $3,
          category = $4,
          length = $5,
          status = $6,
          updated_at = $7
      where post_id = $1
      `,
      [
        postIdFromClient,
        updatedPost.title,
        updatedPost.content,
        updatedPost.category,
        updatedPost.length,
        updatedPost.status,
        updatedPost.updated_at,
      ]
    );

    return res.status(200).json({
      message: `Updated post successfully`,
    });
  } catch {
    return res.status(404).json({
      message: "Server could not find a requested post to update",
    });
  }
});

app.delete("/posts/:postId", async (req, res) => {
  try {
    const postIdFromClient = req.params.postId;

    await connectionPool.query(
      `delete from posts
      where post_id = $1`,
      [postIdFromClient]
    );

    return res.status(200).json({
      message: "Delete post successfully",
    });
  } catch {
    return res.status(404).json({
      message: "Server could not find a requested post to delete",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
