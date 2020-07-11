var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const AWS = require('aws-sdk');

AWS.config.update({
  region : "us-east-1"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var urlencodeParser = bodyParser.urlencoded({ extended: false });

router.get('/', function (req, res, next) {

  var nd = req.cookies.nd;
  if (!nd) {
    res.render('taikhoan', { thongbao: 0, nd: nd });
  } else {
    if (nd.loaiTaiKhoan === 1) {
      res.render('admin', { nd: nd });
    } else if (nd.loaiTaiKhoan === 0) {
      res.render('nguoidung', { nd: nd });
    }
  }
  return;
});

router.post('/dangnhap', urlencodeParser, function (req, res, next) {

  var email = req.body.email;
  var password = req.body.password;

  let params = {
    TableName: "NguoiDung"
  };

  params.FilterExpression = '#email = :email';
  params.ExpressionAttributeNames = { '#email': 'email' };
  params.ExpressionAttributeValues = { ':email': String(email) };
  docClient.scan(params, (err, data) => {
    if (err) {
      res.render('file404');
    } else {
      if (data.Items.length === 0) {
        res.render('taikhoan', { thongbao: "Không có", nd: undefined });
      } else {
        data.Items.forEach((nd) => {
          if (nd.password === password) {
            if (nd.tinhTrang === 1) {
              res.cookie('nd', nd);
              if (nd.loaiTaiKhoan === 1) {
                res.render('admin', { nd: nd });
              } else if (nd.loaiTaiKhoan === 0) {
                res.render('nguoidung', { nd: nd });
              }
            } else {
              res.render('taikhoan', { thongbao: "bị khóa", nd: undefined });
            }
          } else {
            res.render('taikhoan', { thongbao: "pass sai", nd: undefined });
          }
        });
      }
    }
    res.end();
    return;
  });
});

router.get('/dangxuat', function (req, res, next) {
  if (req.cookies) {
    res.clearCookie('nd');
  }
  res.render('taikhoan', { thongbao: "0", nd: undefined });
});

router.post('/dangky', urlencodeParser, function (req, res, next) {

  let email = req.body.email;
  let tenNguoiDung = req.body.tenNguoiDung;
  let password = req.body.password;
  let soDienThoai = req.body.soDienThoai;
  let hinhDaiDien = "hinhdaidien.png";

  var ma = req.body.ma;
  var madagui = req.session.maxacnhan;
  if (ma == madagui) {
    let par = {
      TableName: "NguoiDung"
    };

    par.FilterExpression = '#email = :email';
    par.ExpressionAttributeNames = { '#email': 'email' };
    par.ExpressionAttributeValues = { ':email': String(email) };
    docClient.scan(par, (err, data) => {
      if (err) {
        res.render('file404');
        return;
      } else {
        if (data.Items.length === 0) {
          let params = {
            TableName: 'NguoiDung',
            Item: {
              "loaiTaiKhoan": Number(0),
              "email": String(email),
              "password": String(password),
              "soDienThoai": String(soDienThoai),
              "tenNguoiDung": String(tenNguoiDung),
              "hinhDaiDien": String(hinhDaiDien),
              "tinhTrang": Number(1)
            }
          };
          docClient.put(params, (err, data) => {
            if (err) {
              res.render('file404');
              return;
            }
            else {
              let item = {
                "email": String(email),
                "idLoaiThongBao": Number(1),
                "thongBao": [],
                "thongBaoDaDoc" : []
              };
              let params1 = {
                TableName: 'ThongBao',
                Item: item
              };
              docClient.put(params1, (err, data) => {
                if (err) {
                  res.render('file404');
                  return;
                }
                else {
                  let item = {
                    "email": String(email),
                    "idLoaiThongBao": Number(2),
                    "thongBao": [],
                    "thongBaoDaDoc" : []
                  };
                  let params2 = {
                    TableName: 'ThongBao',
                    Item: item
                  };
                  docClient.put(params2, (err, data) => {
                    if (err) {
                      res.render('file404');
                      return;
                    }
                    else {
                      let item = {
                        "email": String(email),
                        "idLoaiThongBao": Number(3),
                        "thongBao": [],
                        "thongBaoDaDoc" : []
                      };
                      let params3 = {
                        TableName: 'ThongBao',
                        Item: item
                      };
                      docClient.put(params3, (err, data) => {
                        if (err) {
                          res.render('file404');
                          return;
                        }
                        else {
                          res.send("Đăng ký thành công");
                          return;
                        }
                      });
                      return;
                    }
                  });
                  return;
                }
              });
              return;
            }
          });
        } else {
          res.send("Lỗi đăng ký...Hệ thống đang bảo trì chức năng này!!!")
          return;
        }
        return;
      }
    });
  } else {
    res.send("mã sai");
  }

});

router.get('/ktemail/:email', urlencodeParser, function (req, res, next) {

  let email = req.params.email;

  let par = {
    TableName: "NguoiDung"
  };

  par.FilterExpression = '#email = :email';
  par.ExpressionAttributeNames = { '#email': 'email' };
  par.ExpressionAttributeValues = { ':email': String(email) };
  docClient.scan(par, (err, data) => {
    if (err) {
      res.render('file404');
      return;
    } else {
      if (data.Items.length < 1) {
        res.send("0");
      } else {
        res.send("email bị trùng");
      }
      return;
    }
  });
});

router.post('/guiemailquenmatkhau', urlencodeParser, async function (req, res, next) {

  let email = req.body.email;
  let ma = Math.floor(Math.random() * 900000 + 100000);
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tranquangthinhtk1997@gmail.com',
      pass: 'toi<3ban123'
    }
  });

  // send mail with defined transport object
  let mailOptions = {
    from: 'Chăm Sóc Con Trẻ <tranquangthinhtk1997@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Bạn muốn đổi mật khẩu của tài khoản chứa email này?", // Subject line
    text: "Mã xác nhận : " + ma, // plain text body
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send("lỗi email");
      return;
    }
    req.session.maxacnhan = ma;
    res.send("Mã xác nhận đã được gửi đến email của bạn !!!");
  });
});

router.post('/doimatkhau', urlencodeParser, function (req, res, next) {

  var ma = req.body.ma;
  var madagui = req.session.maxacnhan;
  var email = req.body.email;
  var matkhaumoi = req.body.matkhaumoi;

  if (ma == madagui) {
    let params = {
      TableName: "NguoiDung"
    };

    params.FilterExpression = '#email = :email';
    params.ExpressionAttributeNames = { '#email': 'email' };
    params.ExpressionAttributeValues = { ':email': String(email) };
    docClient.scan(params, (err, data) => {
      if (err) {
        res.send('0');
      } else {
        if (data.Items.length === 0) {
          res.send('0');
          return;
        } else {
          data.Items.forEach((nd) => {
            let par = {
              TableName: 'NguoiDung',

              Key: {
                "loaiTaiKhoan": Number(nd.loaiTaiKhoan),
                "email": String(nd.email)
              },

              UpdateExpression: "set #password = :password",
              ExpressionAttributeNames: {
                '#password': 'password'
              },
              ExpressionAttributeValues: {
                ':password': matkhaumoi
              },
              ReturnValues: "UPDATED_NEW"
            };

            docClient.update(par, async (err, data) => {
              if (err) {
                res.send('0');
                return;
              }
              else {
                res.send('1');
                return;
              }
              return;
            });
          });
        }
      }
      res.end();
      return;
    });
  } else {
    res.send('lỗi');
    return;
  }
});

router.post('/xacnhanma', urlencodeParser, function (req, res, next) {

  var ma = req.body.ma;
  var madagui = req.session.maxacnhan;

  if (ma == madagui) {
    res.send("mã đúng");
  } else {
    res.send("mã sai");
  }
});

router.post('/guiemaildangky', urlencodeParser, async function (req, res, next) {

  let email = req.body.email;
  let ma = Math.floor(Math.random() * 900000 + 100000);
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tranquangthinhtk1997@gmail.com',
      pass: 'toi<3ban123'
    }
  });

  // send mail with defined transport object
  let mailOptions = {
    from: 'Chăm Sóc Con Trẻ <tranquangthinhtk1997@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Bạn đang muốn sử dụng email này để tạo tài khoản?", // Subject line
    text: "Mã xác nhận : " + ma, // plain text body
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send("lỗi email");
      return;
    }
    req.session.maxacnhan = ma;
    console.log(ma);
    res.send("Mã xác nhận đã được gửi đến email của bạn !!!");
  });
});

router.get('/xemthongbaobaiviet', urlencodeParser, async function (req, res, next) {

  let nd = req.cookies.nd;
  let email = nd.email;
  console.log(email);
  let thongBao = {};
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
  await docClient.query(par).promise()
    .then(async (data) => {
      if (data.Items.length !== 0) {
        let thongBaoDaDoc = data.Items[0].thongBaoDaDoc;
        if(thongBaoDaDoc == undefined){
          thongBaoDaDoc = [];
        }
        thongBao = {
          "listThongBaoDaDoc": data.Items[0].thongBaoDaDoc,
          "listThongBao": data.Items[0].thongBao,
          "listUsers": listUsers
        }
        console.log(data.Items[0].thongBao);
        let newND = {
          "loaiTaiKhoan": nd.loaiTaiKhoan,
          "email": nd.email,
          "password": nd.password,
          "tenNguoiDung": nd.tenNguoiDung,
          "soDienThoai": nd.soDienThoai,
          "hinhDaiDien": nd.hinhDaiDien,
          "thongBaoBaiViet": Number(0),
          "thongBaoTinNhan": nd.thongBaoTinNhan,
          "thongBaoXoaBai": nd.thongBaoXoaBai
        }
        res.cookie('nd', newND);
        
        updateThongBao(email, 1, thongBaoDaDoc, data.Items[0].thongBao);
        
        res.send(thongBao);

        return;
      } 
    })
    .catch((err) => {
      res.render('file404');
    });

});

router.get('/xemthongbaotinnhan', urlencodeParser, async function (req, res, next) {

  let nd = req.cookies.nd;
  let email = nd.email;
  let thongBao = {};
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
    ':idLoaiThongBao': Number(2)
  };
  await docClient.query(par).promise()
    .then(async (data) => {
      if (data.Items.length !== 0) {
        let thongBaoDaDoc = data.Items[0].thongBaoDaDoc;
        if(thongBaoDaDoc == undefined){
          thongBaoDaDoc = [];
        }
        thongBao = {
          "listThongBaoDaDoc": data.Items[0].thongBaoDaDoc,
          "listThongBao": data.Items[0].thongBao,
          "listUsers": listUsers
        }
        console.log(data.Items[0].thongBao);
        let newND = {
          "loaiTaiKhoan": nd.loaiTaiKhoan,
          "email": nd.email,
          "password": nd.password,
          "tenNguoiDung": nd.tenNguoiDung,
          "soDienThoai": nd.soDienThoai,
          "hinhDaiDien": nd.hinhDaiDien,
          "thongBaoBaiViet": nd.thongBaoBaiViet,
          "thongBaoTinNhan": Number(0),
          "thongBaoXoaBai": nd.thongBaoXoaBai
        }
        res.cookie('nd', newND);
        
        updateThongBaoTinNhan(email, 2, thongBaoDaDoc, data.Items[0].thongBao);
        
        res.send(thongBao);

        return;
      } 
    })
    .catch((err) => {
      res.render('file404');
    });
});

router.get('/updatethongbaotinnhan/:emailNguoiGui/:emailNguoiNhan/:noiDung', urlencodeParser, async function (req, res, next) {

  let emailNguoiGui = req.params.emailNguoiGui;
  let emailNguoiNhan = req.params.emailNguoiNhan;
  let noiDung = req.params.noiDung;
  console.log(emailNguoiGui +"==="+emailNguoiNhan+"==="+noiDung);

  var d = new Date();
  var ngayDang = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  var gioDang = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

  let tb = {
    "id" : Number(Date.now()),
		"email" : emailNguoiGui,
		"noiDung" : noiDung,
		"date" : ngayDang,
		"time" : gioDang
  }

  console.log("email Thongsfasf = " + emailNguoiNhan);
  console.log(tb);

  let par = {
    TableName: "ThongBao",
  };
  par.FilterExpression = '#email = :email and #idLoaiThongBao =:idLoaiThongBao';
  par.ExpressionAttributeNames = { 
    '#email': 'email',
    '#idLoaiThongBao': 'idLoaiThongBao'
  };
  par.ExpressionAttributeValues = { 
    ':email': String(emailNguoiNhan),
    ':idLoaiThongBao': Number(2)
  };
  docClient.scan(par).promise()
  .then((data) => {
      if(data.Items.length !== 0){
        let isThongBao = 0;
        let thongBao = data.Items[0].thongBao;
        for(let i = 0; i < thongBao.length ; i++){
          if(thongBao[i].email == tb.email){
            isThongBao = 1;
            break;
          }
        }
        if(isThongBao == 0){
          thongBao.push(tb);
          let params1 = {
            TableName: 'ThongBao',
        
            Key: {
              "email": String(emailNguoiNhan),
              "idLoaiThongBao": Number(2)
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
                  "email": String(emailNguoiNhan)
                },
            
                UpdateExpression: "set #thongBaoTinNhan = :thongBaoTinNhan",
                ExpressionAttributeNames: {
                  '#thongBaoTinNhan': 'thongBaoTinNhan'
                },
                ExpressionAttributeValues: {
                  ':thongBaoTinNhan': Number(1)
                },
                ReturnValues: "UPDATED_NEW"
              };
            
              docClient.update(params2, async (err, data) => {
                if (err) {
                  return false;
                }
                else {
                  res.send("Gửi thông báo thành công");
                  return true;
                }
              });
              return true;
            }
          });
          return true;
        }
      }
      return true;
  })
  .catch((err) => {
    console.log(`${err}`);
  });
});

function updateThongBaoTinNhan(email, idLoaiThongBao, thongBaoDaDoc, thongBao) {
  console.log("thongbao = " );
  console.log(thongBao);
  console.log("thongbaoDaDoc = " );
  console.log(thongBaoDaDoc);
  thongBao.forEach((tb) => {
    thongBaoDaDoc.push(tb);
    console.log("???");
  });
  console.log(thongBaoDaDoc.length);
  let params = {
    TableName: 'ThongBao',

    Key: {
      "email": String(email),
      "idLoaiThongBao": Number(idLoaiThongBao)
    },

    UpdateExpression: "set #thongBao = :thongBao, #thongBaoDaDoc = :thongBaoDaDoc",
    ExpressionAttributeNames: {
      '#thongBao': 'thongBao',
      '#thongBaoDaDoc': 'thongBaoDaDoc'
    },
    ExpressionAttributeValues: {
      ':thongBao': [],
      ':thongBaoDaDoc': thongBaoDaDoc
    },
    ReturnValues: "UPDATED_NEW"
  };

  docClient.update(params, async (err, data) => {
    if (err) {
      return false;
    }
    else {
      let params1 = {
        TableName: 'NguoiDung',

        Key: {
          "loaiTaiKhoan": Number(0),
          "email": String(email)
        },

        UpdateExpression: "set #thongBaoTinNhan = :thongBaoTinNhan",
        ExpressionAttributeNames: {
          '#thongBaoTinNhan': 'thongBaoTinNhan'
        },
        ExpressionAttributeValues: {
          ':thongBaoTinNhan': Number(0)
        },
        ReturnValues: "UPDATED_NEW"
      };

      docClient.update(params1, async (err, data) => {
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

function updateThongBaoXoaBai(email, idLoaiThongBao, thongBaoDaDoc, thongBao) {
  console.log("thongbao = " );
  console.log(thongBao);
  console.log("thongbaoDaDoc = " );
  console.log(thongBaoDaDoc);
  thongBao.forEach((tb) => {
    thongBaoDaDoc.push(tb);
    console.log("???");
  });
  console.log(thongBaoDaDoc.length);
  let params = {
    TableName: 'ThongBao',

    Key: {
      "email": String(email),
      "idLoaiThongBao": Number(idLoaiThongBao)
    },

    UpdateExpression: "set #thongBao = :thongBao, #thongBaoDaDoc = :thongBaoDaDoc",
    ExpressionAttributeNames: {
      '#thongBao': 'thongBao',
      '#thongBaoDaDoc': 'thongBaoDaDoc'
    },
    ExpressionAttributeValues: {
      ':thongBao': [],
      ':thongBaoDaDoc': thongBaoDaDoc
    },
    ReturnValues: "UPDATED_NEW"
  };

  docClient.update(params, async (err, data) => {
    if (err) {
      return false;
    }
    else {
      let params1 = {
        TableName: 'NguoiDung',

        Key: {
          "loaiTaiKhoan": Number(0),
          "email": String(email)
        },

        UpdateExpression: "set #thongBaoXoaBai = :thongBaoXoaBai",
        ExpressionAttributeNames: {
          '#thongBaoXoaBai': 'thongBaoXoaBai'
        },
        ExpressionAttributeValues: {
          ':thongBaoXoaBai': Number(0)
        },
        ReturnValues: "UPDATED_NEW"
      };

      docClient.update(params1, async (err, data) => {
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

router.get('/xemthongbaoxoabai', urlencodeParser, async function (req, res, next) {

  let nd = req.cookies.nd;
  let email = nd.email;
  let thongBao = {};

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
    ':idLoaiThongBao': Number(3)
  };
  await docClient.query(par).promise()
    .then(async (data) => {
      if (data.Items.length !== 0) {
        let thongBaoDaDoc = data.Items[0].thongBaoDaDoc;
        if(thongBaoDaDoc == undefined){
          thongBaoDaDoc = [];
        }
        thongBao = {
          "listThongBaoDaDoc": data.Items[0].thongBaoDaDoc,
          "listThongBao": data.Items[0].thongBao,
        }
        console.log(data.Items[0].thongBao);
        let newND = {
          "loaiTaiKhoan": nd.loaiTaiKhoan,
          "email": nd.email,
          "password": nd.password,
          "tenNguoiDung": nd.tenNguoiDung,
          "soDienThoai": nd.soDienThoai,
          "hinhDaiDien": nd.hinhDaiDien,
          "thongBaoBaiViet": nd.thongBaoBaiViet,
          "thongBaoTinNhan": nd.thongBaoTinNhan,
          "thongBaoXoaBai": Number(0)
        }
        res.cookie('nd', newND);
        
        updateThongBaoXoaBai(email, 3, thongBaoDaDoc, data.Items[0].thongBao);
        
        res.send(thongBao);

        return;
      } 
    })
    .catch((err) => {
      res.render('file404');
    });

});

function updateThongBao(email, idLoaiThongBao, thongBaoDaDoc, thongBao) {
  console.log("thongbao = " );
  console.log(thongBao);
  console.log("thongbaoDaDoc = " );
  console.log(thongBaoDaDoc);
  thongBao.forEach((tb) => {
    thongBaoDaDoc.push(tb);
    console.log("???");
  });
  console.log(thongBaoDaDoc.length);
  let params = {
    TableName: 'ThongBao',

    Key: {
      "email": String(email),
      "idLoaiThongBao": Number(idLoaiThongBao)
    },

    UpdateExpression: "set #thongBao = :thongBao, #thongBaoDaDoc = :thongBaoDaDoc",
    ExpressionAttributeNames: {
      '#thongBao': 'thongBao',
      '#thongBaoDaDoc': 'thongBaoDaDoc'
    },
    ExpressionAttributeValues: {
      ':thongBao': [],
      ':thongBaoDaDoc': thongBaoDaDoc
    },
    ReturnValues: "UPDATED_NEW"
  };

  docClient.update(params, async (err, data) => {
    if (err) {
      return false;
    }
    else {
      let params1 = {
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
          ':thongBaoBaiViet': Number(0)
        },
        ReturnValues: "UPDATED_NEW"
      };

      docClient.update(params1, async (err, data) => {
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

router.get('/changethongbao', urlencodeParser, async function (req, res, next) {

  let email = req.cookies.nd.email;
  let params = {
    TableName: "NguoiDung"
  };

  params.FilterExpression = '#email = :email';
  params.ExpressionAttributeNames = { '#email': 'email' };
  params.ExpressionAttributeValues = { ':email': String(email) };
  docClient.scan(params, (err, data) => {
    if (err) {
      res.render('file404');
    } else {
      if (data.Items.length === 0) {
        res.render('taikhoan', { thongbao: "Không có", nd: undefined });
      } else {
          console.log("Pk");
          if (req.cookies) {
            res.clearCookie('nd');
            res.cookie('nd', data.Items[0]);
          }
      }
    }
    res.end();
    return;
  });
});


module.exports = router;