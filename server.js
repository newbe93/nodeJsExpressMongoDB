const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const MongoClient = require("mongodb").MongoClient;

app.use("/public", express.static("public"));

var db;

// MongoDB 접속이 되면 callback 함수 실행해주세요.
MongoClient.connect("mongodb+srv://newbe93:newbe0516@cluster0.tjifyhq.mongodb.net/todoapp?retryWrites=true&w=majority", function (error, client) {
  if (error) return console.log(error);
  db = client.db("todoapp");
  app.listen(8080, function () {
    console.log("listening on 8080");
  }); // 8080 포트로 들어올때 callback 함수를 실행해주세요.
});

app.get("/pet", function (req, res) {
  res.send("펫용품 쇼피알 수 있는 페이지입니다.");
});

app.get("/beauty", function (req, res) {
  res.send("뷰티용품 사세요");
});

app.get("/", function (req, res) {
  res.render("index.ejs");
});

app.get("/write", function (req, res) {
  res.render("write.ejs");
});

app.post("/add", (req, response) => {
  response.send("전송완료");
  db.collection("counter").findOne({ name: "게시물갯수" }, function (err, result) {
    console.log(result.totalPost);
    var totalPostNum = result.totalPost;
    // DB에 저장해주세요
    db.collection("post").insertOne({ _id: totalPostNum + 1, 제목: req.body.title, 날짜: req.body.date }, function (err, result) {
      // coutner 라는 콜렉션에 있는 totalPost 라는 항목도 1 증가 (수정)
      db.collection("counter").updateOne({ name: "게시물갯수" }, { $inc: { totalPost: 1 } }, function (err, result) {
        if (err) return console.log(err);
      });
    });
  });
});

app.get("/list", function (req, response) {
  // db에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      console.log(result);
      response.render("list.ejs", { posts: result });
    });
});

app.delete("/delete", function (req, response) {
  req.body._id = parseInt(req.body._id);
  // db에서 삭제해주세요
  db.collection("post").deleteOne(req.body, function (error, result) {
    console.log("삭제완료");
    response.status(200).send({ message: "성공했습니다." });
  });
});

app.get("/detail/:id", function (req, response) {
  db.collection("post").findOne({ _id: parseInt(req.params.id) }, function (err, result) {
    console.log(result);
    response.render("detail.ejs", { data: result });
  });
});
