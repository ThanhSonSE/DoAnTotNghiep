var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");

const AWS = require('aws-sdk');

AWS.config.update({
  region : "us-east-1"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var urlencodeParser = bodyParser.urlencoded({ extended: false });

//Load Trang danh sách bài biết
router.get('/', function (req, res) {
    var nd = req.cookies.nd;
    let email = nd.email;
    let params = {
        TableName: 'BaiViet'
    };
    params.FilterExpression = '#email = :email';
    params.ExpressionAttributeNames = { '#email': 'email' };
    params.ExpressionAttributeValues = { ':email': String(email) };

    console.log(String(email));
    console.log('Scanning up form danhsachbaiviet...')
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            var bv = data.Items;
            res.render('danhsachbaiviet', { bv: bv , nd : nd });
            console.log("Scan succeeded danhsachbaiviet.");
            return;
        }
    }

});

//Xem chi tiết bài viết
router.get('/:idLoai/:idBai',async function (req, res) {

    var nd = req.cookies.nd;
    let listUsers = [];
    let par1 = {
        TableName: "NguoiDung",
      };
      await docClient.scan(par1).promise()
        .then((data) => {
          listUsers = data.Items;
        })
        .catch((err) => {
          console.log(err);
        });

    let idBai = req.params.idBai;
    let idLoai = req.params.idLoai;
    console.log(idBai +" - "+ idLoai)
    let par = {
        TableName: "BaiViet",
      };
      par.KeyConditionExpression = '#idLoai = :idLoai and #idBai =:idBai';
      par.ExpressionAttributeNames = {
        '#idLoai': 'idLoai',
        '#idBai': 'idBai'
      };
      par.ExpressionAttributeValues = {
        ':idLoai': Number(idLoai),
        ':idBai': Number(idBai)
      };
      await docClient.query(par).promise()
        .then(async (data) => {
          if(data.Items.length !== 0){
            res.render('chitietbaiviet', {
                baiviet: data.Items[0],
                nd: nd,
                listUsers : listUsers
            });
            return;
          }else{
            res.render('chitietbaiviet', {
                baiviet: undefined,
                nd: nd,
                listUsers : listUsers
            });
            return;
          }
        })
        .catch((err) => {
            console.log("Lỗi");
            res.render('chitietbaiviet', {
                baiviet: undefined,
                nd: nd,
                listUsers : listUsers
            });
            return;
        });
    
});


module.exports = router;