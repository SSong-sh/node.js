var router = require("express").Router();

function 로그인했니(요청, 응답, next) {
  if (요청.user) {
    //로그인 후 세션이 있으면 요청.user가 항상 있음
    next(); //요청.user가 있으면 next() 통과
  } else {
    응답.send("로그인 안 하셨어요");
  }
}

router.use(로그인했니);

router.get("/shirts", function (요청, 응답) {
  응답.send("셔츠 파는 페이지입니다.");
});

router.get("/pants", function (요청, 응답) {
  응답.send("바지 파는 페이지입니다.");
});

module.exports = router;
//
