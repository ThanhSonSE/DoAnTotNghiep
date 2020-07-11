var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");

const AWS = require('aws-sdk');

AWS.config.update({
  region : "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var urlencodeParser = bodyParser.urlencoded({ extended: false });


/* GET home page. */
router.get('/', async function (req, res, next) {
  var listSucKhoe = await layBaiCuaMuc(1, 5);
  var listGiaoDuc = await layBaiCuaMuc(2, 5);
  var listDinhDuong = await layBaiCuaMuc(3, 5);
  var listKyNang = await layBaiCuaMuc(4, 5);
  var nd = req.cookies.nd;
  console.log(nd);
  var listBaiDangThichNhieu = [];
  let par = {
    TableName: "BaiDang",
  };
  await docClient.scan(par).promise()
    .then((data) => {
      listBaiDangThichNhieu = data.Items;
      
     listBaiDangThichNhieu.sort((a,b)=>b.nguoiThich.length - a.nguoiThich.length);
      if (listBaiDangThichNhieu.length > 6) {
        listBaiDangThichNhieu.splice(6, listBaiDangThichNhieu.length - 1);
      }

    })
    .catch((err) => {
      console.log(`${err}`);
    });

  res.render('trangchu', { listSucKhoe: listSucKhoe, listGiaoDuc: listGiaoDuc, listDinhDuong: listDinhDuong, listKyNang: listKyNang , listBaiDangThichNhieu: listBaiDangThichNhieu , nd : nd});
});

router.get('/:muc', async function (req, res, next) {
  var muc = req.params.muc;
  var nd = req.cookies.nd;
  var listBaiDangThichNhieu = [];
  let par = {
    TableName: "BaiDang",
  };
  await docClient.scan(par).promise()
    .then((data) => {
      listBaiDangThichNhieu = data.Items;
      
     listBaiDangThichNhieu.sort((a,b)=>b.nguoiThich.length - a.nguoiThich.length);
      if (listBaiDangThichNhieu.length > 6) {
        listBaiDangThichNhieu.splice(6, listBaiDangThichNhieu.length - 1);
      }

    })
    .catch((err) => {
      console.log(`${err}`);
    });

  if (muc > 0 && muc < 5) {
    var list = await layBaiCuaMuc(muc, 10);
    var tenMuc = "Sức Khỏe";
    if (muc == 2) {
      tenMuc = "Giáo Dục";
    } else if (muc == 3) {
      tenMuc = "Ăn Uống & Dinh Dưỡng";
    } else if (muc == 4) {
      tenMuc = "Kỹ Năng Sống";
    }
    res.render('chitietmuc', { list: list,listBaiDangThichNhieu:listBaiDangThichNhieu, tenMuc: tenMuc , idLoai : muc,nd : nd });
  } else {
    res.render('file404');
  }
});

router.get('/:muc/:idBai', async function (req, res, next) {
  var muc = req.params.muc;
  var idBai = req.params.idBai;
  var nd = req.cookies.nd;

  var listUsers = [];


  let params1 = {
    TableName: "NguoiDung",
  };
  params1.KeyConditionExpression = '#loaiTaiKhoan = :loaiTaiKhoan ';
  params1.ExpressionAttributeNames = {
    '#loaiTaiKhoan': 'loaiTaiKhoan'
  };
  params1.ExpressionAttributeValues = {
    ':loaiTaiKhoan': Number(0)
  };
  await docClient.query(params1).promise()
    .then(async (data) => {
      data.Items.forEach((user) => {
        if(user.tinhTrang === 1){
          listUsers.push(user);
        }
      });
    })
    .catch((err) => {
      res.render('file404');
    });

  var listBaiDangThichNhieu = [];
  let par = {
    TableName: "BaiDang",
  };
  await docClient.scan(par).promise()
    .then((data) => {
      listBaiDangThichNhieu = data.Items;
      
     listBaiDangThichNhieu.sort((a,b)=>b.nguoiThich.length - a.nguoiThich.length);
      if (listBaiDangThichNhieu.length > 6) {
        listBaiDangThichNhieu.splice(6, listBaiDangThichNhieu.length - 1);
      }

    })
    .catch((err) => {
      console.log(`${err}`);
    });

  let params = {
    TableName: "BaiDang",
  };
  params.KeyConditionExpression = '#idLoai = :idLoai and #idBai =:idBai';
  params.ExpressionAttributeNames = {
    '#idLoai': 'idLoai',
    '#idBai': 'idBai'
  };
  params.ExpressionAttributeValues = {
    ':idLoai': Number(muc),
    ':idBai': Number(idBai)
  };
  await docClient.query(params).promise()
    .then(async (data) => {
      await data.Items.forEach((bai) => {
        res.render('chitietbaidang', { bai: bai, nd : nd, listBaiDangThichNhieu : listBaiDangThichNhieu, listUsers : listUsers});
        return;
      });
      res.render('file404');
    })
    .catch((err) => {
      res.render('file404');
    });
});

async function layBaiCuaMuc(idLoai, n) {
  var list = [];
  let par = {
    TableName: "BaiDang",
  };
  par.FilterExpression = '#l = :idLoai';
  par.ExpressionAttributeNames = { '#l': 'idLoai' };
  par.ExpressionAttributeValues = { ':idLoai': Number(idLoai) };
  await docClient.scan(par).promise()
    .then((data) => {
      list = data.Items;
      if (list.length > n) {
        list.splice(0, list.length - n);
      }
    })
    .catch((err) => {
      console.log(`${err}`);
    });
  list.sort((a,b)=>b.idBai - a.idBai);
  return list;
}

router.post('/dangbinhluanbaidang',urlencodeParser, async function (req, res, next) {

  var idBinhLuan = req.body.idBinhLuan;
  var emailNguoiBinhLuan = req.body.emailNguoiBinhLuan;
  var noiDungBinhLuan = req.body.noiDungBinhLuan;
  var idBai = req.body.idBai;
  var idLoai = req.body.idLoai;
  var d = new Date();
  var ngayDang = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  var gioDang = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

  var noiDungBL = [];
  
  let par = {
    TableName: "BaiDang",
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
        console.log("data.Items[0].binhLuan =" + data.Items[0].binhLuan);
        if(data.Items[0].binhLuan !== undefined){
          noiDungBL = data.Items[0].binhLuan;
        } 
      }
    })
    .catch((err) => {
      res.render('file404');
    });


  let ndBinhLuan = {
    "idBinhLuan" : Number(idBinhLuan),
		"emailNguoiBinhLuan" : String(emailNguoiBinhLuan),
		"noiDungBinhLuan" : String(noiDungBinhLuan),
		"dateBinhLuan" : String(ngayDang),
		"timeBinhLuan" : String(gioDang),
		"traLoiBinhLuan" : undefined
  }
  noiDungBL.push(ndBinhLuan);
  console.log("noiDungGui" + noiDungBL.length);
  let params = {
    TableName: 'BaiDang',

    Key: {
      "idLoai": Number(idLoai),
      "idBai": Number(idBai)
    },

    UpdateExpression: "set #binhLuan = :binhLuan",
    ExpressionAttributeNames: {
      '#binhLuan': 'binhLuan'
    },
    ExpressionAttributeValues: {
      ':binhLuan': noiDungBL
    },
    ReturnValues: "UPDATED_NEW"
  };

  docClient.update(params, async (err, data) => {
    if (err) {
      res.render('file404');
    }
    else {
      res.send("gửi thành công");
    }
    return;
  });
});

router.post('/dangtraloibinhluanbaidang',urlencodeParser, async function (req, res, next) {

  var idTraLoiBinhLuan = req.body.idTraLoiBinhLuan;
  var idBinhLuan = req.body.idBinhLuan;
  var emailNguoiTraLoiBinhLuan = req.body.emailNguoiTraLoiBinhLuan;
  var noiDungTraLoiBinhLuan = req.body.noiDungTraLoiBinhLuan;
  var idBai = req.body.idBai;
  var idLoai = req.body.idLoai;
  console.log("idBai" + idBai);
  console.log("idLoai" + idLoai);
  var d = new Date();
  var ngayDang = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  var gioDang = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

  var noiDungBL = [];
  
  let par = {
    TableName: "BaiDang",
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
        console.log("data.Items[0].binhLuan =" + data.Items[0].binhLuan);
        if(data.Items[0].binhLuan !== undefined){
          noiDungBL = data.Items[0].binhLuan;
        }

        let ndTLBinhLuan = {
          "idTraLoiBinhLuan" : Number(idTraLoiBinhLuan),
          "emailNguoiTraLoiBinhLuan" : String(emailNguoiTraLoiBinhLuan),
          "noiDungTraLoiBinhLuan" : String(noiDungTraLoiBinhLuan),
          "dateTraLoiBinhLuan" : String(ngayDang),
          "timeTraLoiBinhLuan" : String(gioDang)
        }
        for(var i = 0 ; i < noiDungBL.length ; i++){
          console.log("noiDungBL.length" + noiDungBL.length);
          if(noiDungBL[i].idBinhLuan == idBinhLuan){
            if(noiDungBL[i].traLoiBinhLuan !== undefined){
              console.log("thêm khi có mảng");
              noiDungBL[i].traLoiBinhLuan.push(ndTLBinhLuan);
            }else{
              console.log("thêm khi k có mảng");
              noiDungBL[i].traLoiBinhLuan = [];
              noiDungBL[i].traLoiBinhLuan.push(ndTLBinhLuan);
            }
            break;
          }
        }
        console.log("noiDungGui???" + noiDungBL.length);
        let params = {
          TableName: 'BaiDang',
      
          Key: {
            "idLoai": Number(idLoai),
            "idBai": Number(idBai)
          },
      
          UpdateExpression: "set #binhLuan = :binhLuan",
          ExpressionAttributeNames: {
            '#binhLuan': 'binhLuan'
          },
          ExpressionAttributeValues: {
            ':binhLuan': noiDungBL
          },
          ReturnValues: "UPDATED_NEW"
        };
      
        docClient.update(params, async (err, data) => {
          if (err) {
            res.render('file404');
          }
          else {
            res.send("bình luận thành công");
          }
          return;
        });
      }
      else{
        res.send("bình luận thất bại");
      }
    })
    .catch((err) => {
      res.render('file404');
      res.send("bình luận thất bại");
    });

});

//Tìm bài
router.get('/timbaidang/:thongTinTim/:idLoai/:soLuong',async function (req, res, next) {
  var thongTinTim = req.params.thongTinTim;
  var soLuong = req.params.soLuong;
  var idLoai = req.params.idLoai;

  let par = {
    TableName: "BaiDang"
  };
  par.FilterExpression = '#idLoai = :idLoai';
  par.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
  par.ExpressionAttributeValues = { ':idLoai': Number(idLoai)};
  docClient.scan(par, (err, data) => {
      if (err) {
          res.render('file404');
      } else {
        if(thongTinTim == ""){
          let list = data.Items;
          list.sort((a,b)=>b.idBai - a.idBai);
          res.send(list);
        }else{
          let list = [];
          let dem = 0;
          data.Items.sort((a,b)=>b.idBai - a.idBai);
          for(let i = 0 ; i < data.Items.length ; i++){
            let bai = data.Items[i];
            
            if(bai.tieuDe.toLowerCase().indexOf(thongTinTim.toLowerCase())>=0){
              list.push(bai);
              dem++;
            }else if(bai.date.indexOf(thongTinTim)>-1){
              list.push(bai);
              dem++
            }else if(bai.time.indexOf(thongTinTim)>-1){
              list.push(bai);
              dem++
            }
            
            if(dem == soLuong){
              break;
            }

          }
          res.send(list);
        }
      }   
  });
});



module.exports = router;
