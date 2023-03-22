const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
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

app.get("/edit/:id", function (req, response) {
  db.collection("post").findOne({ _id: parseInt(req.params.id) }, function (err, result) {
    response.render("edit.ejs", { data: result });
  });
});

app.put("/edit", function (req, response) {
  // 폼에 담긴 데이터를 가지고 post collection에 업데이트.

  db.collection("post").updateOne({ _id: parseInt(req.body.id) }, { $set: { 제목: req.body.title, 날짜: req.body.date } }, function (err, result) {
    console.log("수정오나료");
    response.redirect("/list");
  });
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

// app.use(미들웨어) : 미들웨어를 쓰겠다.
// 미들웨어 ? 웹서버는 요청-응답 중간에 뭔가 실행되는 코드
app.use(session({ secret: "비밀코드", resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", function (req, res) {
  res.render("login.ejs");
});

// local 방식으로 회원인지 인증해주세요
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  function (req, res) {
    res.redirect("/");
  }
);

// 마이페이지 접속
app.get("/mypage", isLogin, function (req, res) {
  console.log(req.user);
  res.render("mypage.ejs", { 사용자: req.user });
});

// 미들웨어 만들기
function isLogin(req, res, next) {
  if (req.user) {
    // 로그인 후 세션이 있으면 항상 req.user가 있다.
    next(); // 통과
  } else {
    res.send("로그인 안하셨는데요");
  }
}

// 인증하는 방법을 strategy라고 함.
passport.use(
  new LocalStrategy(
    {
      usernameField: "id", // 폼에 작성한 name
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      //console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러); // done(서버에러, 성공시 사용자 DB데이터(아이디 비번 안맞으면 false), 에러메세지 )

        if (!결과) return done(null, false, { message: "존재하지않는 아이디요" });
        if (입력한비번 == 결과.pw) {
          return done(null, 결과);
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      });
    }
  )
);

// 5. 세션만들기
// 세션 저장시키는 코드(로그인 성공시 발동)
passport.serializeUser(function (user, done) {
  // 위의 doen(null, 결과) 의 결과가 user로 들어감.
  done(null, user.id);
});

// 로그인한 유저의 개인정보를 DB에서 찾는 역할
// 이 세션 데이터를 가진 사람을 DB에서 찾아주세요 (마이페이지 접속시 발동)
// 로그인해있으면 아이디에 user.id가 자동으로 들어감
passport.deserializeUser(function (아이디, done) {
  // DB에서 위에있는 user.id로 유저를 찾은 뒤에 유저 정보(result)를 넣어줌.
  db.collection("login").findOne({ id: 아이디 }, function (err, result) {
    done(null, result); //  안에 넣음 -> mypage get요청할때 req.user에 담겨짐.
  });
});
