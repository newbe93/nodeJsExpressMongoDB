const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const MongoClient = require("mongodb").MongoClient;

var db;

// MongoDB 접속이 되면 callback 함수 실행해주세요.
MongoClient.connect("mongodb+srv://newbe93:newbe0516@cluster0.tjifyhq.mongodb.net/todoapp?retryWrites=true&w=majority", function (error, client) {
  if (error) return console.log(error);
  db = client.db("todoapp");
  db.collection("post").insertOne({ 이름: "John", 나이: 20, _id: 100 }, function (error, result) {
    console.log("저장완료");
  });
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
  res.sendFile(__dirname + "/index.html");
});

app.get("/write", function (req, res) {
  res.sendFile(__dirname + "/write.html");
});

app.post("/add", (req, res) => {
  res.send("전송완료");
  console.log(req.body);
  // DB에 저장해주세요
  db.collection("post").insertOne({ 제목: req.body.title, 날짜: req.body.date }, function (err, result) {});
});

app.get("/list", function (req, res) {
  res.render("list.ejs");
});
