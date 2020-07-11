var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
const AWS = require('aws-sdk');

AWS.config.update({
  region : "us-east-1"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var urlencodeParser = bodyParser.urlencoded({ extended: false });

router.get('/diendan', async function (req, res, next) {
  var nd = req.cookies.nd;
  var idLoai = 1;
  var soLuong = 5;

  var listUsers = [];
  var listBaiViet = [];
  var listBaiDang = [];
  if (!nd) {
    res.render("taikhoan", { thongbao: 0 ,nd:nd});
  } else {
    //Lấy danh sách người dùng
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

    //Lấy danh sách bài viết
    let par = {
      TableName: "BaiViet",
    };
    par.FilterExpression = '#idLoai = :idLoai';
    par.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
    par.ExpressionAttributeValues = { ':idLoai': Number(idLoai) };
    await docClient.scan(par).promise()
    .then((data) => {
      data.Items.forEach((baiViet)=>{
          listBaiViet = data.Items;
          listBaiViet.sort((a,b)=>a.idBai - b.idBai);
          listBaiViet.reverse();
          if(listBaiViet.length >soLuong){
            listBaiViet.splice(soLuong, listBaiViet.length-soLuong);
          }
      });
    })
    .catch((err) => {
      console.log(`${err}`);
    });
    //Lấy danh sách bài đăng
    let par2 = {
      TableName: "BaiDang",
    };
    par2.FilterExpression = '#l = :idLoai';
    par2.ExpressionAttributeNames = { '#l': 'idLoai' };
    par2.ExpressionAttributeValues = { ':idLoai': Number(idLoai) };
    await docClient.scan(par2).promise()
      .then((data) => {
        listBaiDang = data.Items;
        listBaiDang.sort((a,b)=>a.idBai - b.idBai);
        listBaiDang.reverse();
      })
      .catch((err) => {
        console.log(`${err}`);
      });

    res.render("diendan", { nd: nd, listUsers: listUsers , listBaiViet : listBaiViet , listBaiDang : listBaiDang});
  }
});

router.get('/diendan/listbai/:idLoai/:soLuong', async function (req, res, next) {

  var nd = req.cookies.nd;
  var idLoai = req.params.idLoai;
  var soLuong = Number(req.params.soLuong);

  var listUsers = [];
  var listBaiViet = [];
  //Lấy danh sách người dùng
  let par1 = {
    TableName: "NguoiDung",
  };
  await docClient.scan(par1).promise()
    .then(async (data) => {
      listUsers = data.Items;

      //Lấy danh sách bài viết
      let par = {
        TableName: "BaiViet",
      };
      par.FilterExpression = '#idLoai = :idLoai';
      par.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
      par.ExpressionAttributeValues = { ':idLoai': Number(idLoai) };
      await docClient.scan(par).promise()
      .then((data) => {
        listBaiViet = data.Items;
        listBaiViet.sort((a,b)=>b.idBai - a.idBai);
        if(listBaiViet.length >soLuong){
          listBaiViet.splice(soLuong, listBaiViet.length-soLuong);
        }
        let result = {
          listUsers : listUsers,
          listBaiViet : listBaiViet
        }
        console.log("listUsers =" + listUsers.length);
        console.log("listBaiViet =" + listBaiViet.length);
        res.send(result);
      })
      .catch((err) => {
        console.log(`${err}`);
      });
    })
    .catch((err) => {
      console.log(err);
    });
  
});

router.post('/diendan/timbaiviet', async function (req, res, next) {

  var nd = req.cookies.nd;
  var idLoai = req.body.idLoai;
  var soLuong = req.body.soLuong;
  var ndTim = req.body.ndTim;
  console.log(idLoai +" = "+ ndTim);

  var listUsers = [];
  var listBaiViet = [];
  //Lấy danh sách người dùng
  let par1 = {
    TableName: "NguoiDung",
  };
  await docClient.scan(par1).promise()
    .then(async (data) => {
      listUsers = data.Items;

      //Lấy danh sách bài viết
      let par = {
        TableName: "BaiViet",
      };
      par.FilterExpression = '#idLoai = :idLoai';
      par.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
      par.ExpressionAttributeValues = { ':idLoai': Number(idLoai) };
      await docClient.scan(par).promise()
      .then((data) => {
        let list = [];
        list = data.Items;
        list.sort((a,b)=>b.idBai - a.idBai);
        let dem = 0;
        console.log("nd Tim = "+ ndTim);
        for(let i = 0; i < list.length  ; i++){
          for(let j = 0 ; j < listUsers.length ; j++){
            if(list[i].email == listUsers[j].email){
              if(listUsers[j].tenNguoiDung.toLowerCase().indexOf(ndTim.toLowerCase()) >= 0){
                listBaiViet.push(list[i]);
                dem +=1;
                break;
              }
            }
          }
          if(dem == soLuong){
            break;
          }
        }
        let result = {
          listUsers : listUsers,
          listBaiViet : listBaiViet
        }
        console.log("listUsers =" + listUsers.length);
        console.log("listBaiViet =" + listBaiViet.length);
        res.send(result);
      })
      .catch((err) => {
        console.log(`${err}`);
      });
    })
    .catch((err) => {
      console.log(err);
    });
  
});

router.get('/diendan/listbaidang/:idLoai', async function (req, res, next) {

  var idLoai = req.params.idLoai;
  var listBaiDang = [];
    let par2 = {
      TableName: "BaiDang",
    };
    par2.FilterExpression = '#l = :idLoai';
    par2.ExpressionAttributeNames = { '#l': 'idLoai' };
    par2.ExpressionAttributeValues = { ':idLoai': Number(idLoai) };
    await docClient.scan(par2).promise()
      .then((data) => {
        listBaiDang = data.Items;
        listBaiDang.sort((a,b)=>b.idBai - a.idBai);
        if(listBaiDang.length > 3){
          listBaiDang.splice(3,listBaiDang.length);
        }
        console.log("ListBaiDang = " + listBaiDang.length);
        res.send(listBaiDang);
      })
      .catch((err) => {
        console.log(`${err}`);
      });
  
});



router.post('/dangbaiviet', urlencodeParser, async function (req, res, next) {

  let ngDung = req.cookies.nd;
  let idLoai = req.body.idLoai;
  let idBaiViet = req.body.idBai;
  console.log("idLoai =" + idLoai);
  console.log("idBaiViet =" + idBaiViet);
  let nd = req.body.noiDungBaiViet;
  var d = new Date();
  var ngayDang = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  var gioDang = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  let par = {
    TableName: "BaiViet"
  };
  par.FilterExpression = '#idLoai = :idLoai';
  par.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
  par.ExpressionAttributeValues = { ':idLoai': Number(idLoai) };

  await docClient.scan(par, (err, data) => {
    if (err) {
      res.render('file404');
      return;
    } else {
      let params = {
        TableName: 'BaiViet',
        Item: {
          "idLoai" : Number(idLoai),
          "idBai": Number(idBaiViet),
          "email" : String(ngDung.email),
          "noiDung": String(nd),
          "soKhieuNai": undefined,
          "date": String(ngayDang),
          "time" : String(gioDang),
          "tinhTrang" : Number(1),
          "nguoiThich" : undefined,
          "binhLuan" : undefined
        }
      };
      docClient.put(params, (err, data) => {
        if (err) {
          res.render('file404');
          return;
        }
        else {
          res.send("thêm thành công");
        }
      });
    }
  });
});

router.post('/likebaiviet/', urlencodeParser, async function (req, res, next) {

  let nd = req.cookies.nd;
  let idLoai = req.body.idLoai;
  let idBaiViet = req.body.idBaiViet;
  let isLike = req.body.isLike;

  console.log(idLoai + "---" + idBaiViet + "---" + isLike);
  let listNguoiThich = [];
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
    ':idBai': Number(idBaiViet)
  };
  await docClient.query(par).promise()
    .then(async (data) => {
      if((data.Items)[0].nguoiThich !== undefined){
        console.log((data.Items)[0]);
        listNguoiThich = (data.Items)[0].nguoiThich;
      }

      let vitri = listNguoiThich.indexOf(nd.email);
      if(isLike == 1){
        if(vitri < 0){
          listNguoiThich.push(nd.email);
        }
      }else if(isLike == 0){
        if(vitri > -1){
          listNguoiThich.splice(vitri,1);
        }
      }
      console.log("listNGuoiThic = " + listNguoiThich);
        let params = {
          TableName: 'BaiViet',
    
          Key: {
            "idLoai": Number(idLoai),
            "idBai": Number(idBaiViet)
          },
    
          UpdateExpression: "set #nguoiThich = :nguoiThich",
          ExpressionAttributeNames: {
            '#nguoiThich': 'nguoiThich'
          },
          ExpressionAttributeValues: {
            ':nguoiThich': listNguoiThich
          },
          ReturnValues: "UPDATED_NEW"
        };
    
        docClient.update(params, async (err, data) => {
          if (err) {
            res.render('file404');
          }
          else {
            res.send("like thành công");
          }
          return;
        });
    })
    .catch((err) => {
      res.send("like thất bại");
      return;
    });
});

router.get('/diendan/mochat/:emailA/:emailB/:soLuong', async function (req, res, next) {

  var nd = req.cookies.nd;
  var emailNguoiChatA = req.params.emailA;
  var emailNguoiChatB = req.params.emailB;
  var soLuong = req.params.soLuong;
  console.log(emailNguoiChatA + "---" + emailNguoiChatB);
  let dem = 0;

  var noiDungChat = [];
  
  let par = {
    TableName: "Chat",
  };
  par.KeyConditionExpression = '#emailNguoiChatA = :emailNguoiChatA and #emailNguoiChatB =:emailNguoiChatB';
  par.ExpressionAttributeNames = {
    '#emailNguoiChatA': 'emailNguoiChatA',
    '#emailNguoiChatB': 'emailNguoiChatB'
  };
  par.ExpressionAttributeValues = {
    ':emailNguoiChatA': String(emailNguoiChatA),
    ':emailNguoiChatB': String(emailNguoiChatB)
  };
  await docClient.query(par).promise()
    .then(async (data) => {
      if(data.Items.length !== 0){
        dem = 1;
        console.log("+++");
        noiDungChat = data.Items[0].noiDungChat;
        if(noiDungChat.length > soLuong){
          noiDungChat.splice(0, noiDungChat.length-soLuong);
        }
        console.log(noiDungChat.length);
        res.send(noiDungChat);
      }
    })
    .catch((err) => {
      res.render('file404');
    });

  if(dem === 0){
    let params = {
      TableName: "Chat",
    };
    params.KeyConditionExpression = '#emailNguoiChatA = :emailNguoiChatA and #emailNguoiChatB =:emailNguoiChatB';
    params.ExpressionAttributeNames = {
      '#emailNguoiChatA': 'emailNguoiChatA',
      '#emailNguoiChatB': 'emailNguoiChatB'
    };
    params.ExpressionAttributeValues = {
      ':emailNguoiChatA': String(emailNguoiChatB),
      ':emailNguoiChatB': String(emailNguoiChatA)
    };
    await docClient.query(params).promise()
      .then(async (data) => {
        if(data.Items.length !== 0){
          dem = 1;
          noiDungChat = data.Items[0].noiDungChat;
          if(noiDungChat.length > soLuong){
            noiDungChat.splice(0, noiDungChat.length-soLuong);
          }
          res.send(noiDungChat);
        }
      })
      .catch((err) => {
        res.render('file404');
      });
  }

  if(dem === 0){
    let params1 = {
      TableName: 'Chat',
      Item: {
        "emailNguoiChatA" : String(emailNguoiChatA),
        "emailNguoiChatB" : String(emailNguoiChatB),    
        "anhDaiDienNguoiA" : String("Ảnh A"),
        "anhDaiDienNguoiB" : String("Ảnh B"),
        "noiDungChat" : noiDungChat
      }
    };
    docClient.put(params1, (err, data) => {
      if (err) {
        res.render('file404');
        return;
      }
      else {
        res.send(noiDungChat);
      }
    });
  }
  
});

router.post('/diendan/dangbinhluan',urlencodeParser, async function (req, res, next) {

  var idBinhLuan = req.body.idBinhLuan;
  var emailNguoiBinhLuan = req.body.emailNguoiBinhLuan;
  var noiDungBinhLuan = req.body.noiDungBinhLuan;
  var idBai = req.body.idBai;
  var idLoai = req.body.idLoai;
  var d = new Date();
  var ngayDang = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  var gioDang = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

  var noiDungBL = [];
  console.log("Tới đây nè");
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
      console.log("vào đc nè");
      if(data.Items.length !== 0){
        console.log("data.Items[0].binhLuan =" + data.Items[0].binhLuan);
        let emailBai =  data.Items[0].email;
        let ndBai =  data.Items[0].noiDung;
        if(data.Items[0].binhLuan !== undefined){
          noiDungBL = data.Items[0].binhLuan;
        }

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
          TableName: 'BaiViet',
      
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
            console.log(emailBai);
            let tb ={
              "id" : Number(Date.now()),
              "idLoai": Number(idLoai),
              "idBai" :Number(idBai),
              "email" : emailNguoiBinhLuan,
              "noiDungBai" :ndBai,
              "date" : ngayDang,
              "time" : gioDang
            }
            if(emailNguoiBinhLuan != emailBai){
              await updateThongBao(emailBai,tb,res);
            }
            res.send("bình luận thành công");
          }
          return;
        });
      }else{
        console.log("Tới lỗi nè");
        res.send("bình luận thất bại");
      }
    })
    .catch((err) => {
      res.send("bình luận thất bại");
      return
    });
});

function updateThongBao(email,tb,res){
  
  let par = {
    TableName: "ThongBao",
  };
  par.KeyConditionExpression = '#email = :email and #idLoaiThongBao =:idLoaiThongBao';
  par.ExpressionAttributeNames = {
    '#email': 'email',
    '#idLoaiThongBao': 'idLoaiThongBao'
  };
  par.ExpressionAttributeValues = {
    ':email': String(email),
    ':idLoaiThongBao': Number(1)
  };
  docClient.query(par).promise()
    .then(async (data) => {
      if(data.Items.length !== 0){
        let isThongBao = 0;
        let thongBao = data.Items[0].thongBao;
        for(let i = 0; i < thongBao.length ; i++){
          if(thongBao[i].idLoai == tb.idLoai && thongBao[i].idBai == tb.idBai && thongBao[i].email == tb.email){
            isThongBao = 1;
            break;
          }
        }
        if(isThongBao == 0){
          thongBao.push(tb);
        let params1 = {
          TableName: 'ThongBao',
      
          Key: {
            "email": String(email),
            "idLoaiThongBao": Number(1)
          },
      
          UpdateExpression: "set #thongBao = :thongBao",
          ExpressionAttributeNames: {
            '#thongBao': 'thongBao'
          },
          ExpressionAttributeValues: {
            ':thongBao': thongBao,
          },
          ReturnValues: "UPDATED_NEW"
        };
      
        docClient.update(params1, async (err, data) => {
          if (err) {
            return false;
          }
          else {
            let params2 = {
              TableName: 'NguoiDung',
          
              Key: {
                "loaiTaiKhoan": Number(0),
                "email": String(email)
              },
          
              UpdateExpression: "set #thongBaoBaiViet = :thongBaoBaiViet",
              ExpressionAttributeNames: {
                '#thongBaoBaiViet': 'thongBaoBaiViet'
              },
              ExpressionAttributeValues: {
                ':thongBaoBaiViet': Number(1)
              },
              ReturnValues: "UPDATED_NEW"
            };
          
            docClient.update(params2, async (err, data) => {
              if (err) {
                return false;
              }
              else {
                return true;
              }
            });
            return true;
          }
        });
        }
      }
    })
    .catch((err) => {
      res.render('file404');
    });
}


router.post('/diendan/dangtraloibinhluan',urlencodeParser, async function (req, res, next) {

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
          TableName: 'BaiViet',
      
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

router.post('/diendan/guichat',urlencodeParser, async function (req, res, next) {

  var emailNguoiChatA = req.body.email;
  var emailGui = emailNguoiChatA;
  var emailNguoiChatB = req.body.guiChoEmail;
  var noiDungGui = req.body.noiDungGui;
  console.log(emailNguoiChatA+"???"+emailNguoiChatB);
  let dem = 0;

  var noiDungChat = [];
  
  let par = {
    TableName: "Chat",
  };
  par.KeyConditionExpression = '#emailNguoiChatA = :emailNguoiChatA and #emailNguoiChatB =:emailNguoiChatB';
  par.ExpressionAttributeNames = {
    '#emailNguoiChatA': 'emailNguoiChatA',
    '#emailNguoiChatB': 'emailNguoiChatB'
  };
  par.ExpressionAttributeValues = {
    ':emailNguoiChatA': String(emailNguoiChatA),
    ':emailNguoiChatB': String(emailNguoiChatB)
  };
  await docClient.query(par).promise()
    .then(async (data) => {
      if(data.Items.length !== 0){
        dem = 1;
        console.log("+++");
        noiDungChat = data.Items[0].noiDungChat;
      }
    })
    .catch((err) => {
      res.render('file404');
    });

  if(dem === 0){
    let params = {
      TableName: "Chat",
    };
    params.KeyConditionExpression = '#emailNguoiChatA = :emailNguoiChatA and #emailNguoiChatB =:emailNguoiChatB';
    params.ExpressionAttributeNames = {
      '#emailNguoiChatA': 'emailNguoiChatA',
      '#emailNguoiChatB': 'emailNguoiChatB'
    };
    params.ExpressionAttributeValues = {
      ':emailNguoiChatA': String(emailNguoiChatB),
      ':emailNguoiChatB': String(emailNguoiChatA)
    };
    await docClient.query(params).promise()
      .then(async (data) => {
        if(data.Items.length !== 0){
          console.log("???");
          let temp = emailNguoiChatA;
          emailNguoiChatA = emailNguoiChatB;
          emailNguoiChatB = temp;
          noiDungChat = data.Items[0].noiDungChat;
        }
      })
      .catch((err) => {
        res.render('file404');
      });
  }

  var d = new Date();
  var ngayDang = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  var gioDang = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

  let ndChat = {
    "date" : String(ngayDang),
    "time" : String(gioDang),
    "emailNguoiGui" : String(emailGui),
    "noiDungGui" : String(noiDungGui)

  }
  noiDungChat.push(ndChat);
  console.log("noiDungGui" + noiDungChat.length);
  let params = {
    TableName: 'Chat',

    Key: {
      "emailNguoiChatA": String(emailNguoiChatA),
      "emailNguoiChatB": String(emailNguoiChatB)
    },

    UpdateExpression: "set #noiDungChat = :noiDungChat",
    ExpressionAttributeNames: {
      '#noiDungChat': 'noiDungChat'
    },
    ExpressionAttributeValues: {
      ':noiDungChat': noiDungChat
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


router.post('/diendan/tocao',urlencodeParser, async function (req, res, next) {

  var emailNguoiToCao = req.body.emailNguoiToCao;
  var idBai = req.body.idBai;
  var idLoai = req.body.idLoai;
  let isXoa = 0;
 
  console.log("emailNguoiToCao :" + emailNguoiToCao);
  console.log("idBai :" + idBai);
  console.log("idLoai :" + idLoai);

  var soKhieuNai = [];
  
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
        if(data.Items[0].soKhieuNai !== undefined){
          soKhieuNai = data.Items[0].soKhieuNai
        }
        isXoa = 1;
      }else{
        res.send("Bài viết này đã bị xóa !!!");
        return;
      }
    })
    .catch((err) => {
      res.send("Bài viết này đã bị xóa !!!");
      return;
    });

  if(isXoa == 1){
    if(soKhieuNai.indexOf(emailNguoiToCao) < 0){
      soKhieuNai.push(emailNguoiToCao);
    }
    let params = {
      TableName: 'BaiViet',
  
      Key: {
        "idLoai": Number(idLoai),
        "idBai": Number(idBai)
      },
  
      UpdateExpression: "set #soKhieuNai = :soKhieuNai",
      ExpressionAttributeNames: {
        '#soKhieuNai': 'soKhieuNai'
      },
      ExpressionAttributeValues: {
        ':soKhieuNai': soKhieuNai
      },
      ReturnValues: "UPDATED_NEW"
    };
  
    docClient.update(params, async (err, data) => {
      if (err) {
        res("Bài viết này đã bị xóa !!!");
        return;
      }
      else {
        res.send("tố cáo thành công");
      }
      return;
    });
  }
});
module.exports = router;