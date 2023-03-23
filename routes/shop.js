var router = require("express").Router();

// router.get("/shop/shirts", function (req, res) {
//   res.send("셔츠 파는 페이지입니다.");
// });

// router.get("/shop/pants", function (req, res) {
//   res.send("바지 파는 페이지입니다.");
// });

// or

function isLogin(req, res, next) {
  if (req.user) {
    // 로그인 후 세션이 있으면 항상 req.user가 있다.
    next(); // 통과
  } else {
    res.send("로그인 안하셨는데요");
  }
}
router.use(isLogin);
router.get("/shirts", isLogin, function (req, res) {
  res.send("셔츠 파는 페이지입니다.");
});

router.get("/pants", isLogin, function (req, res) {
  res.send("바지 파는 페이지입니다.");
});

module.exports = router;
