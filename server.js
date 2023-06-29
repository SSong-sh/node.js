const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");

var db;
MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.10arsak.mongodb.net/?retryWrites=true&w=majority",
  function (에러, client) {
    //연결되면 할 일
    if (에러) {
      return console.log(에러);
    }
    db = client.db("todoapp");

    db.collection("post").insertOne(
      { 이름: "song", _id: 100 },
      function (에러, 결과) {
        console.log("저장완료");
      }
    );
    app.listen(8080, function () {
      console.log("listening on 8080");
    });
    /* 8080 port로 웹서버를 열고 잘 열리면 listeninf on 8080을 출력해주세요*/
  }
);

app.get("/pet", function (요청, 응답) {
  응답.send("펫 용품 쇼핑할 수 있는 페이지입니다.");
});
/* 누군가가 /pet으로 방문하면 pet 관련된 안내문을 띄어주자 */

app.get("/beauty", function (요청, 응답) {
  응답.send("뷰티 용품을 쇼핑할 수 있는 페이지입니다.");
});

app.get("/", function (요청, 응답) {
  응답.sendFile(__dirname + "/index.html");
});
// "/" 홈이라는 뜻

app.get("/write", function (요청, 응답) {
  응답.sendFile(__dirname + "/write.html");
});

app.post("/add", function (요청, 응답) {
  응답.send("전송완료");
  db.collection("counter").findOne(
    { name: "게시물갯수" },
    function (에러, 결과) {
      console.log(결과.totalPost);
      var 총게시물갯수 = 결과.totalPost;
      db.collection("post").insertOne(
        { _id: 총게시물갯수 + 1, 제목: 요청.body.title, 날짜: 요청.body.date },
        function (에러, 결과) {
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
        }
      );
    }
  );
});

app.delete("/delete", function (요청, 응답) {
  console.log(요청.body);
  요청.body._id = parseInt(요청.body._id);
  //요청.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요
  db.collection("post").deleteOne(요청.body, function (에러, 결과) {
    console.log("삭제완료");
    응답.status(200).send({ message: "성공했습니다" });
  });
});

app.get("/list", function (요청, 응답) {
  // 모든 데이터 꺼내는 공식
  db.collection("post")
    .find()
    .toArray(function (에러, 결과) {
      console.log(결과);
      응답.render("list.ejs", { posts: 결과 });
    });
});
