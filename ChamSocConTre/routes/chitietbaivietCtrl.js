var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");

const AWS = require('aws-sdk');

AWS.config.update({
  region : "us-east-1"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var urlencodeParser = bodyParser.urlencoded({ extended: false });

router.get('/deleteBai/:idLoai/:idBai', async function (req, res, next) {
    var idLoai = req.params.idLoai;
    var idBai = req.params.idBai;
  
    console.log(idLoai + idBai);
    let params = {
      TableName: 'BaiViet',
      Key: {
        "idLoai": Number(idLoai),
        "idBai": Number(idBai)
      }
    };
    docClient.delete(params, async (err, data) => {
      if (err) {
        res.send("Admin đã xóa bài của bạn !!!");
      } else {
        res.send("Xóa thành công!!!");
      }
    });
  });

module.exports = router;