const http = require("http");
const mongoose = require("mongoose");
const headers = require("./headers");
const dotenv = require("dotenv"); //重要**
dotenv.config({ path: "./config.env" }); //重要**
const Post = require("./model/posts");
const errorHandle = require("./errorHandle");
const { truncateSync } = require("fs");
const sucessHandle = require("./sucessHandle");

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_password
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("mongoDB server get");
  })
  .catch((error) => console.log(error));

const requestListener = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  if (req.url === "/posts" && req.method === "GET") {
    try {
      const get_allPost = await Post.find();
      if (get_allPost.length !== 0) {
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "sucess",
            message: "搜尋所有post",
            get_allPost,
          })
        );
        res.end();
      } else {
        sucessHandle(res, "尚未有任何貼文");
      }
    } catch {
      (error) => console.log(error);
    }
  } else if (req.url === "/posts" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const post_data = JSON.parse(body);

        if (post_data.content != undefined) {
          const new_post = await Post.create({
            name: post_data.name,
            content: post_data.content,
            tags: post_data.tags,
            type: post_data.type,
          });

          sucessHandle(res, new_post);
        } else {
          errorHandle.handleError(res);
        }
      } catch (err) {
        errorHandle.handleError(res, err);
      }
    });
  } else if (req.url == "/posts" && req.method === "DELETE") {
    try {
      await Post.deleteMany();
      sucessHandle(res, "delete all posts");
    } catch (error) {
      errorHandle.handleError(res, error);
    }
  } else if (req.url.startsWith("/posts/") && req.method === "DELETE") {
    const id = req.url.split("/").pop();
    try {
      const delete_data = await Post.findById(id);
      await Post.findByIdAndDelete(id);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "sucess",
          message: `${delete_data.name}的貼文已被刪除`,
          data: null,
        })
      );
      res.end();
    } catch (error) {
      errorHandle.error_route(res);
    }
  } else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
    req.on("end", async () => {
      try {
        const Patch_data = JSON.parse(body);
        if (Patch_data.content != undefined && Patch_data.content.trim()) {
          const id = req.url.split("/").pop();
          const Patch_data = await Post.findById(id);
          const data = JSON.parse(body);
          const new_post = await Post.findByIdAndUpdate(id, data, {
            new: true,
          });
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "sucess",
              message: `${Patch_data.name}的貼文已被更新`,
              update_data: new_post,
            })
          );
          res.end();
        } else {
          errorHandle.handleError(res);
        }
      } catch (error) {
        errorHandle.handleError(res, error);
      }
    });
  } else if (req.url === "/posts" && req.method === "OPITIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    errorHandle.error_route(res);
  }
};

const server = http.createServer(requestListener);
server.listen(3005);
console.log("server get");
