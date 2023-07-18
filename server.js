const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
const { ObjectId } = require("mongodb");
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

app.use("/public", express.static("public"));

var db;
MongoClient.connect(process.env.DB_URL, function (에러, client) {
  //연결되면 할 일
  if (에러) {
    return console.log(에러);
  }
  db = client.db("todoapp");

  app.listen(process.env.PORT, function () {
    console.log("listening on 8080");
  });
  /* 8080 port로 웹서버를 열고 잘 열리면 listeninf on 8080을 출력해주세요*/
});

app.get("/", function (요청, 응답) {
  응답.render("index.ejs");
});
// "/" 홈이라는 뜻

app.get("/write", function (요청, 응답) {
  응답.render("write.ejs");
});

app.get("/edit/:id", function (요청, 응답) {
  db.collection("post").findOne(
    { _id: parseInt(요청.params.id) },
    function (에러, 결과) {
      응답.render("edit.ejs", { post: 결과 });
    }
  );
});

app.get("/list", function (요청, 응답) {
  // 모든 데이터 꺼내는 공식
  db.collection("post")
    .find()
    .toArray(function (에러, 결과) {
      응답.render("list.ejs", { posts: 결과 });
    });
});

app.get("/detail/:id", function (요청, 응답) {
  db.collection("post").findOne(
    { _id: parseInt(요청.params.id) },
    function (에러, 결과) {
      응답.render("detail.ejs", { data: 결과 });
    }
  );
});

app.put("/edit", function (요청, 응답) {
  db.collection("post").updateOne(
    { _id: parseInt(요청.body.id) },
    { $set: { 제목: 요청.body.title, 날짜: 요청.body.date } },
    function (에러, 결과) {
      console.log("수정완료");
      응답.redirect("/list");
    }
  );
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", function (요청, 응답) {
  응답.render("login.ejs");
});
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
    //로컬 방식으로 인증해주시고 회원인증 실패하면 /fail로 이동시켜주세요
  }),
  function (요청, 응답) {
    응답.redirect("/");
    //회원인증 성공하고 그러면 홈으로 보내주세요
  }
);

app.get("/mypage", 로그인했니, function (요청, 응답) {
  console.log(요청.user);
  응답.render("mypage.ejs", { 사용자: 요청.user });
});

function 로그인했니(요청, 응답, next) {
  if (요청.user) {
    //로그인 후 세션이 있으면 요청.user가 항상 있음
    next(); //요청.user가 있으면 next() 통과
  } else {
    응답.send("로그인 안 하셨어요");
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      //유저가 입력한 아이디/비번 항목이 뭔지 정의 (name 속성)
      session: true, //로그인 후 세션을 저장할 것인지
      passReqToCallback: false, //아이디, 비번 말고도 다른 정보 검증시
    },
    function (입력한아이디, 입력한비번, done) {
      //아이디/비번 맞는지 DB와 비교
      console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne(
        { id: 입력한아이디 },
        function (에러, 결과) {
          if (에러) return done(에러);

          if (!결과)
            //결과에 아무것도 없을 때 =db에 아이디가 없으면
            return done(null, false, { message: "존재하지않는 아이디요" });
          if (입력한비번 == 결과.pw) {
            //db에 아이디가 있으면, 입력한비번과 결과.pw 비교
            return done(null, 결과); //done(서버에러,성공시사용자db데이터,에러메세지)
          } else {
            return done(null, false, { message: "비번틀렸어요" });
          }
        }
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  //결과가 user로 들어감
  done(null, user.id); //id를 이용해서 세션을 저장시키는 코드 (로그인성공시 발동)
});

passport.deserializeUser(function (아이디, done) {
  //로그인한 유저의 세션아이디를 바탕으로 개인정보를 db에서 찾는 역할
  db.collection("login").findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과); //이 세션 데이터를 가진 사람을 db에서 찾아주세요 (마이페이지 접속시 발동)
  });
});

app.post("/register", function (요청, 응답) {
  const id = 요청.body.id;
  const pw = 요청.body.pw;

  db.collection("login").insertOne({ id: id, pw: pw }, function (에러, 결과) {
    if (에러) {
      console.error(에러);
      return 응답.status(500).send("등록 중 오류가 발생했습니다.");
    }

    // 등록이 성공한 경우에 대한 처리
    console.log("등록이 성공했습니다.");
    응답.redirect("/"); // 등록 성공 후 리다이렉션할 경로 설정
  });
});

app.post("/add", function (요청, 응답) {
  응답.send("전송완료");
  db.collection("counter").findOne(
    { name: "게시물갯수" },
    function (에러, 결과) {
      var 총게시물갯수 = 결과.totalPost;

      var 저장내용 = {
        _id: 총게시물갯수 + 1,
        작성자: 요청.user._id,
        제목: 요청.body.title,
        날짜: 요청.body.date,
      };
      db.collection("post").insertOne(저장내용, function (에러, 결과) {
        console.log("저장완료");
        //카운터라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜야 함(수정)
        db.collection("counter").updateOne(
          { name: "게시물갯수" },
          { $inc: { totalPost: 1 } },
          function (에러, 결과) {
            if (에러) {
              return console.log(에러);
            }
          }
        );
      });
    }
  );
});

app.delete("/delete", function (요청, 응답) {
  console.log(요청.body);
  요청.body._id = parseInt(요청.body._id);
  //요청.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요
  var 삭제할데이터 = { _id: 요청.body._id, 작성자: 요청.user.id };
  db.collection("post").deleteOne(삭제할데이터, function (에러, 결과) {
    console.log("삭제완료");
    if (에러) {
      console.log(에러);
    }
    응답.status(200).send({ message: "성공했습니다" });
  });
});

app.get("/fail", function (요청, 응답) {
  응답.render("fail.ejs");
});

app.get("/search", (요청, 응답) => {
  var 검색조건 = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: 요청.query.value,
          path: "제목", // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        },
      },
    },
  ];
  console.log(요청.query);
  db.collection("post")
    .aggregate(검색조건)
    .toArray((에러, 결과) => {
      console.log(결과);
      응답.render("search.ejs", { posts: 결과 });
    });
});

// app.use("/shop", require("./routes/shop.js"));
// app.use("/board/sub", require("./routes/board.js"));

let multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/image");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

// var path = require('path');

// var upload = multer({
//     storage: storage,
//     fileFilter: function (req, file, callback) {
//         var ext = path.extname(file.originalname);
//         if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
//             return callback(new Error('PNG, JPG만 업로드하세요'))
//         }
//         callback(null, true)
//     },
//     limits:{
//         fileSize: 1024 * 1024
//     }
// });

app.get("/upload", function (요청, 응답) {
  응답.render("upload.ejs");
});

app.post("/upload", upload.single("profile"), function (요청, 응답) {
  응답.send("업로드완료");
});

app.get("/image/:imageName", function (요청, 응답) {
  응답.sendFile(__dirname + "/public/image/" + 요청.params.imageName);
});

app.post("/chatroom", function (요청, 응답) {
  var 저장할거 = {
    title: "무슨무슨채팅방",
    member: [ObjectId(요청.body.당한사람id), 요청.user._id],
    date: new Date(),
  };

  db.collection("chatroom")
    .insertOne(저장할거)
    .then(function (결과) {
      응답.send("저장완료");
    });
});
