const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;

MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.10arsak.mongodb.net/?retryWrites=true&w=majority",
  function (에러, client) {
    app.listen(8080, function () {
      console.log("listening on 8080");
    });
    /* 8080 port로 웹서버를 열고 잘 열리면 listeninf on 8080을 출력해주세요 */
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
  console.log(요청.body.title);
});
