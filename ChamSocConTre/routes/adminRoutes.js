var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
let multer = require("multer");
const nodemailer = require("nodemailer");

const AWS = require('aws-sdk');

AWS.config.update({
  region : "us-east-1"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var urlencodeParser = bodyParser.urlencoded({ extended: false });

router.get('/danhsachbaidang', async function (req, res, next) {
  let nd = req.cookies.nd;
  let par = {
    TableName: "BaiDang"
  };
  par.FilterExpression = '#idLoai = :idLoai';
  par.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
  par.ExpressionAttributeValues = { ':idLoai': Number(1) };
  docClient.scan(par, (err, data) => {
    if (err) {
      res.render('file404');
    } else {
      let list = data.Items;
      list.sort((a, b) => b.idBai - a.idBai);
      res.render('danhsachbaidang', { list: list, nd: nd });
    }

  });

});

router.get('/baidangtheoloai/:idLoai', async function (req, res, next) {

  let idLoai = req.params.idLoai;
  let nd = req.cookies.nd;

  let par = {
    TableName: "BaiDang"
  };
  par.FilterExpression = '#idLoai = :idLoai';
  par.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
  par.ExpressionAttributeValues = { ':idLoai': Number(idLoai) };
  docClient.scan(par, (err, data) => {
    if (err) {
      res.render('file404');
    } else {
      let list = data.Items;
      list.sort((a, b) => b.idBai - a.idBai);
      res.send(list);
    }

  });

});

//View đăng bài
router.get('/viewdangbai', async function (req, res, next) {
  let nd = req.cookies.nd;
  res.render('dangbai', { nd: nd });
});

// Khởi tạo biến cấu hình cho việc lưu trữ file upload
let diskStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Định nghĩa nơi file upload sẽ được lưu lại
    callback(null, "public/images");
  },
  filename: (req, file, callback) => {
    // ở đây các bạn có thể làm bất kỳ điều gì với cái file nhé.
    // Mình ví dụ chỉ cho phép tải lên các loại ảnh png & jpg
    let math = ["image/png", "image/jpeg", "image/jpeg", "image/gif"];
    if (math.indexOf(file.mimetype) === -1) {
      let errorMess = `Lỗi file ảnh !!!`;
      return callback(errorMess, null);
    }
    // Tên của file thì mình nối thêm một cái nhãn thời gian để đảm bảo không bị trùng.
    let filename = `${Date.now()}-${file.originalname}`;
    console.log("Hình = " + filename);
    callback(null, filename);
  }
});
// Khởi tạo middleware uploadFile với cấu hình như ở trên,
// Bên trong hàm .single() truyền vào name của thẻ input, ở đây là "file"


//Đăng bài
router.post('/dangbai/:soPhanParams', urlencodeParser, async function (req, res, next) {

  console.log("Tới đây!!!");

  let soPhanParams = req.params.soPhanParams;
  let dataFields = [
    { name: 'file', maxCount: 1 }
  ];
  for (let m = 1; m <= soPhanParams; m++) {
    let field = {
      name: "imgP" + m,
      maxCount: 10
    };
    dataFields.push(field);
  }

  let uploadFile2 = multer({ storage: diskStorage }).fields(dataFields);
  uploadFile2(req, res, (error) => {
    if (error) {
      return res.send(`Hình phải có đuôi .jpeg / .jpg / .png / .gif !!!`);
    }

    var nd = req.cookies.nd;

    var soPhan = req.body.soPhan;
    var tieuDe = req.body.tieuDe;
    var tomTatND = req.body.tomTatND;
    var chuDe = req.body.chuDe;
    var hinhTieuDe = req.files['file'][0].filename;
    console.log("hinhTIeu de = " + hinhTieuDe);
    var noiDungCacPhan = [];
    var d = new Date();
    var ngayDang = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    var gioDang = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

    var idBai = Date.now();
    let par = {
      TableName: "BaiDang"
    };
    par.FilterExpression = '#idLoai = :idLoai';
    par.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
    par.ExpressionAttributeValues = { ':idLoai': Number(chuDe) };

    docClient.scan(par, (err, data) => {
      if (err) {
        res.render('file404');
        return;
      } else {

        for (let i = 1; i <= soPhan; i++) {
          let hinhCuaPhan = [];
          if (req.files['imgP' + i] == undefined) {
            hinhCuaPhan == undefined;
          } else {
            for (let l = 0; l < req.files['imgP' + i].length; l++) {
              hinhCuaPhan.push({ "hinh": (req.files['imgP' + i])[l].filename });
              console.log("(req.files['imgP'+i])[" + l + "].filename = " + (req.files['imgP' + i])[l].filename);
            }
            console.log("hinhCuaPhan = " + hinhCuaPhan);
          }
          let phan = {
            "thuTuSapXep": Number(i),
            "tieuDePhan": String(req.body['tieuDeP' + i]),
            "noiDungPhan": String(req.body['noiDungP' + i]),
            "hinhAnh": hinhCuaPhan
          };
          noiDungCacPhan.push(phan);
        }

        item = {
          "idLoai": Number(chuDe),
          "idBai": Number(idBai),
          "email": String(nd.email),
          "date": String(ngayDang),
          "time": String(gioDang),
          "hinhTieuDe": String(hinhTieuDe),
          "tieuDe": String(tieuDe),
          "noiDungTomTat": String(tomTatND),
          "tinhTrang": Number(1),
          "noiDung": noiDungCacPhan,
          "nguoiThich": [],
          "binhLuan": undefined
        }

        //Add vào bảng BaiDang
        let params = {
          TableName: 'BaiDang',
          Item: item
        };
        docClient.put(params, (err, data) => {
          if (err) {
            res.render('file404');
            return;
          }
          else {
            let par1 = {
              TableName: "BaiDang"
            };
            par1.FilterExpression = '#idLoai = :idLoai';
            par1.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
            par1.ExpressionAttributeValues = { ':idLoai': Number(1) };
            docClient.scan(par1, (err, data) => {
              if (err) {
                res.render('file404');
              } else {
                res.send("Đăng bài thành công!!!");
              }

            });
          }
        });
      }
    });
  });

});


//Xóa bài
router.get('/deleteBai/:idLoai/:idBai', async function (req, res, next) {
  var idLoai = req.params.idLoai;
  var idBai = req.params.idBai;

  console.log(idLoai + idBai);
  let params = {
    TableName: 'BaiDang',
    Key: {
      "idLoai": Number(idLoai),
      "idBai": Number(idBai)
    }
  };
  docClient.delete(params, async (err, data) => {
    if (err) {
      res.render("file404");
    } else {
      res.send("xóa thành công");
    }
  });
});

//Tìm bài
router.get('/timbaidang/:thongTinTim/:idLoai', async function (req, res, next) {
  var thongTinTim = req.params.thongTinTim;
  console.log("Tonh TIn = " + thongTinTim);
  var idLoai = req.params.idLoai;

  let par = {
    TableName: "BaiDang"
  };
  par.FilterExpression = '#idLoai = :idLoai';
  par.ExpressionAttributeNames = { '#idLoai': 'idLoai' };
  par.ExpressionAttributeValues = { ':idLoai': Number(idLoai) };
  docClient.scan(par, (err, data) => {
    if (err) {
      res.render('file404');
    } else {
      if (thongTinTim == "") {
        let list = data.Items;
        list.sort((a, b) => b.idBai - a.idBai);
        res.send(list);
      } else {
        let list = [];
        data.Items.forEach((bai) => {
          if (bai.tieuDe.toLowerCase().indexOf(thongTinTim.toLowerCase()) >= 0) {
            list.push(bai);
          } else if (bai.date.indexOf(thongTinTim) > -1) {
            list.push(bai);
          } else if (bai.time.indexOf(thongTinTim) > -1) {
            list.push(bai);
          }
        });

        list.sort((a, b) => b.idBai - a.idBai);
        res.send(list);
      }
    }

  });
});

//View cập nhật
router.get('/viewcapnhat/:idLoai/:idBai', async function (req, res, next) {
  var idLoai = req.params.idLoai;
  var idBai = req.params.idBai;
  let nd = req.cookies.nd;
  let params = {
    TableName: "BaiDang",
  };
  params.KeyConditionExpression = '#idLoai = :idLoai and #idBai =:idBai';
  params.ExpressionAttributeNames = {
    '#idLoai': 'idLoai',
    '#idBai': 'idBai'
  };
  params.ExpressionAttributeValues = {
    ':idLoai': Number(idLoai),
    ':idBai': Number(idBai)
  };
  console.log("TỚi đây???");
  await docClient.query(params).promise()
    .then(async (data) => {
      await data.Items.forEach((bai) => {
        res.render('capnhatbaidang', { bai: bai,nd: nd });
        return;
      });
    })
    .catch((err) => {
      res.render('file404');
    });
});
//Cập nhật bài đăng
router.post('/capnhatbaidang/:soPhanParams', urlencodeParser, async function (req, res, next) {

  console.log("Tới đây!!!");

  let soPhanParams = req.params.soPhanParams;
  let dataFields = [
    { name: 'file', maxCount: 1 }
  ];
  for (let m = 1; m <= soPhanParams; m++) {
    let field = {
      name: "imgP" + m,
      maxCount: 10
    };
    dataFields.push(field);
  }

  let uploadFile2 = multer({ storage: diskStorage }).fields(dataFields);
  uploadFile2(req, res, async (error) => {
    if (error) {
      return res.send(`Hình phải có đuôi .jpeg / .jpg / .png / .gif !!!`);
    }

    var nd = req.cookies.nd;

    var soPhan = req.body.soPhan;
    var tieuDe = req.body.tieuDe;
    var tomTatND = req.body.tomTatND;
    var chuDe = req.body.idLoai;
    var noiDungCacPhanBD = [];
    var noiDungCacPhan = [];
    var hinhTieuDe = "";
    var idBai = req.body.idBai;


    let params1 = {
      TableName: "BaiDang",
    };
    params1.KeyConditionExpression = '#idLoai = :idLoai and #idBai =:idBai';
    params1.ExpressionAttributeNames = {
      '#idLoai': 'idLoai',
      '#idBai': 'idBai'
    };
    params1.ExpressionAttributeValues = {
      ':idLoai': Number(chuDe),
      ':idBai': Number(idBai)
    };
    await docClient.query(params1).promise()
      .then(async (data) => {
        await data.Items.forEach(async (b) => {
          noiDungCacPhanBD = b.noiDung;
          console.log("noiDung = " + noiDungCacPhanBD.length);
          hinhTieuDe = b.hinhTieuDe;
        });
      })
      .catch((err) => {
      });


    if (req.files['file'] !== undefined) {
      hinhTieuDe = req.files['file'][0].filename;
    }


    for (let i = 1; i <= soPhan; i++) {
      let hinhCuaPhan = [];
      if (req.files['imgP' + i] == undefined) {
        if (noiDungCacPhanBD[i - 1] == undefined) {
          console.log("noiDungCacPhanBD[i - 1] = null");
          hinhCuaPhan == undefined;
        } else {
          if (noiDungCacPhanBD[i - 1].hinhAnh == undefined) {
            console.log("noiDungCacPhanBD[i - 1].hinhAnh = null");
            hinhCuaPhan == undefined;
          } else {
            hinhCuaPhan = noiDungCacPhanBD[i - 1].hinhAnh;
            console.log("noiDungCacPhanBD[i - 1].hinhAnh = " + hinhCuaPhan.length);
          }
        }
      } else {
        for (let l = 0; l < req.files['imgP' + i].length; l++) {
          hinhCuaPhan.push({ "hinh": (req.files['imgP' + i])[l].filename });
          console.log("(req.files['imgP'+i])[" + l + "].filename = " + (req.files['imgP' + i])[l].filename);
        }
        console.log("hinhCuaPhan = " + hinhCuaPhan);
      }
      let phan = {
        "thuTuSapXep": Number(i),
        "tieuDePhan": String(req.body['tieuDeP' + i]),
        "noiDungPhan": String(req.body['noiDungP' + i]),
        "hinhAnh": hinhCuaPhan
      };
      noiDungCacPhan.push(phan);
    }

    let params = {
      TableName: 'BaiDang',

      Key: {
        "idLoai": Number(chuDe),
        "idBai": Number(idBai)
      },

      UpdateExpression: "set #tieuDe = :tieuDe, #noiDungTomTat = :noiDungTomTat, #hinhTieuDe = :hinhTieuDe, #noiDung = :noiDung",
      ExpressionAttributeNames: {
        '#tieuDe': 'tieuDe',
        '#noiDungTomTat': 'noiDungTomTat',
        '#hinhTieuDe': 'hinhTieuDe',
        '#noiDung': 'noiDung',
      },
      ExpressionAttributeValues: {
        ':tieuDe': String(tieuDe),
        ':noiDungTomTat': String(tomTatND),
        ':hinhTieuDe': String(hinhTieuDe),
        ':noiDung': noiDungCacPhan
      },
      ReturnValues: "UPDATED_NEW"
    };

    docClient.update(params, async (err, data) => {
      if (err) {
        res.render('file404');
      }
      else {
        res.send("Cập nhật thành công!!!");
      }
      return;
    });
  });

});

router.get('/danhsachnguoidung', async function (req, res, next) {

  let nd = req.cookies.nd;
  let params = {
    TableName: "NguoiDung",
  };
  params.KeyConditionExpression = '#loaiTaiKhoan = :loaiTaiKhoan ';
  params.ExpressionAttributeNames = {
    '#loaiTaiKhoan': 'loaiTaiKhoan'
  };
  params.ExpressionAttributeValues = {
    ':loaiTaiKhoan': Number(0)
  };
  await docClient.query(params).promise()
    .then(async (data) => {
      res.render("danhsachnguoidung", { listUsers: data.Items, nd: nd });
    })
    .catch((err) => {
      res.render('file404');
    });
});

router.post('/timnguoidung', async function (req, res, next) {

  let thongTinTim = req.body.thongTinTim;
  console.log("tìm = "+thongTinTim);
  let listUsers = [];
  let params = {
    TableName: "NguoiDung",
  };
  params.KeyConditionExpression = '#loaiTaiKhoan = :loaiTaiKhoan ';
  params.ExpressionAttributeNames = {
    '#loaiTaiKhoan': 'loaiTaiKhoan'
  };
  params.ExpressionAttributeValues = {
    ':loaiTaiKhoan': Number(0)
  };
  await docClient.query(params).promise()
    .then(async (data) => {
    
      data.Items.forEach((u)=>{
        if (u.email.toLowerCase().indexOf(thongTinTim.toLowerCase()) >= 0) {
          listUsers.push(u);
        } else if (u.tenNguoiDung.toLowerCase().indexOf(thongTinTim.toLowerCase()) >=0) {
          listUsers.push(u);
        }
      });
      console.log(data.Items.length);
      res.send(listUsers);
    })
    .catch((err) => {
      console.log(err);
      res.render('file404');
    });
});

router.get('/updateTinhTrangNguoiDung/:email/:tinhTrang', async function (req, res, next) {

  var email = req.params.email;
  var tinhTrang = req.params.tinhTrang;
  var changeTinhTrang = 0;
  if (tinhTrang == 0) {
    changeTinhTrang = 1;
  }
  console.log("email " + email);
  console.log("tình trạng " + tinhTrang);
  console.log("Change " + changeTinhTrang);
  let params = {
    TableName: 'NguoiDung',

    Key: {
      "loaiTaiKhoan": Number(0),
      "email": String(email)
    },

    UpdateExpression: "set #tinhTrang = :tinhTrang",
    ExpressionAttributeNames: {
      '#tinhTrang': 'tinhTrang'
    },
    ExpressionAttributeValues: {
      ':tinhTrang': Number(changeTinhTrang)
    },
    ReturnValues: "UPDATED_NEW"
  };

  docClient.update(params, async (err, data) => {
    if (err) {
      res.send("Thay đổi thất bại...Vui lòng kiểm tra lại!!!");
      return;
    }
    else {
      if(changeTinhTrang == 1){
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
          subject: "Tài khoản của bạn đã được mở lại", // Subject line
          text: "Tài khoản của bạn đã được mở lại. Hy vọng bạn không vi phạm nữa. Xin cảm ơn.", // plain text body
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            return;
          }
          
        });
      }else{
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
          subject: "Tài khoản của bạn đã bị khóa", // Subject line
          text: "Bạn đã vi phạm một số quy tắc của website. Chúng tôi sẽ tạm thời khóa tài khoản của bạn. Nếu bạn muốn mở lại hãy liên hệ với chúng tôi. Xin cảm ơn.", // plain text body
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            return;
          }
          
        });
      }
      res.send("Thay đổi thành công !!!");
      return;
    }
  });

});

router.get('/danhsachtocao', async function (req, res, next) {

  let nd = req.cookies.nd;
  let listBaiViet = [];
  let par = {
    TableName: "BaiViet",
  };
  await docClient.scan(par).promise()
    .then((data) => {
      data.Items.forEach((baiViet) => {
        if (baiViet.soKhieuNai !== undefined && baiViet.tinhTrang == 1) {
          listBaiViet.push(baiViet);
        }
      });
    })
    .catch((err) => {
      console.log(`${err}`);
    });

  listBaiViet.sort((a, b) => b.soKhieuNai.length - a.soKhieuNai.length);

  res.render('danhsachkhieunai', { listBaiViet: listBaiViet, nd: nd });
});

router.post('/duyetbai/xoabai', urlencodeParser, async function (req, res, next) {

  let idLoai = req.body.idLoai;
  let idBai = req.body.idBai;
  let emailNguoiNhan = req.body.emailNguoiNhan;
  let ndBai = req.body.ndBai;
  var d = new Date();
  var ngayDang = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  var gioDang = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  
  let params = {
    TableName: 'BaiViet',
    Key: {
      "idLoai": Number(idLoai),
      "idBai": Number(idBai)
    }
  };
  docClient.delete(params, async (err, data) => {
    if (err) {
      res.render("file404");
    } else {
      console.log("Thông báo???");
      let tb = {
        "id": Number(Date.now()),
        "noiDungBai": ndBai,
        "date": ngayDang,
        "time": gioDang
      }
      updateThongBaoXoaBai(emailNguoiNhan, tb, res)
      res.send("xóa thành công");
    }
  });
});

function updateThongBaoXoaBai(email, tb, res) {
  console.log(email);
  console.log(tb);
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
  docClient.query(par).promise()
    .then(async (data) => {
      if (data.Items.length !== 0) {
        let thongBao = data.Items[0].thongBao;
        thongBao.push(tb);


        let params1 = {
          TableName: 'ThongBao',

          Key: {
            "email": String(email),
            "idLoaiThongBao": Number(3)
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

              UpdateExpression: "set #thongBaoXoaBai = :thongBaoXoaBai",
              ExpressionAttributeNames: {
                '#thongBaoXoaBai': 'thongBaoXoaBai'
              },
              ExpressionAttributeValues: {
                ':thongBaoXoaBai': Number(1)
              },
              ReturnValues: "UPDATED_NEW"
            };

            docClient.update(params2, async (err, data) => {
              if (err) {
                return false;
              }
              else {
                console.log(tb);
                return true;
              }
            });
            return true;
          }
        });
      }
    })
    .catch((err) => {
      res.render('file404');
    });
}

router.post('/duyetbai/boduyet', urlencodeParser, async function (req, res, next) {

  let idLoai = req.body.idLoai;
  let idBai = req.body.idBai;
  let params = {
    TableName: 'BaiViet',

    Key: {
      "idLoai": Number(idLoai),
      "idBai": Number(idBai)
    },

    UpdateExpression: "set #tinhTrang = :tinhTrang",
    ExpressionAttributeNames: {
      '#tinhTrang': 'tinhTrang'
    },
    ExpressionAttributeValues: {
      ':tinhTrang': Number(0)
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

async function danhSachBaiDang(list, listBaiDang) {

  if (listBaiDang !== undefined) {
    for (var m = 0; m < listBaiDang.length; m++) {
      let loai = listBaiDang[m];
      if (loai.idBaiDaDang !== undefined) {
        for (var i = 0; i < loai.idBaiDaDang.length; i++) {
          let bai = await timBaiDang(loai.idLoai, (loai.idBaiDaDang)[i]);
          await list.push(bai);
        }
      }
    }
  }
  return list;
}
async function timBaiDang(idLoai, idBai) {

  let bai;
  let params = {
    TableName: "BaiDang",
  };
  params.KeyConditionExpression = '#idLoai = :idLoai and #idBai =:idBai';
  params.ExpressionAttributeNames = {
    '#idLoai': 'idLoai',
    '#idBai': 'idBai'
  };
  params.ExpressionAttributeValues = {
    ':idLoai': Number(idLoai),
    ':idBai': Number(idBai)
  };
  await docClient.query(params).promise()
    .then(async (data) => {
      await data.Items.forEach(async (b) => {
        bai = b;
      });
    })
    .catch((err) => {
    });
  return bai;
}

router.post('/likebaidang', urlencodeParser, async function (req, res, next) {

  let nd = req.cookies.nd;
  let idLoai = req.body.idLoai;
  let idBai = req.body.idBai;
  let isLike = req.body.isLike;

  console.log(idLoai + "---" + idBai + "---" + isLike);
  let listNguoiThich = [];
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
      if ((data.Items)[0].nguoiThich !== undefined) {
        console.log((data.Items)[0]);
        listNguoiThich = (data.Items)[0].nguoiThich;
      }
    })
    .catch((err) => {
      res.render('file404');
    });

  if (isLike == 1) {
    listNguoiThich.push(nd.email);
  } else if (isLike == 0) {
    let vitri = listNguoiThich.indexOf(nd.email);
    listNguoiThich.splice(vitri, 1);
  }
  console.log("listNGuoiThic = " + listNguoiThich);
  let params = {
    TableName: 'BaiDang',

    Key: {
      "idLoai": Number(idLoai),
      "idBai": Number(idBai)
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
});

router.get('/baivietbikhieunai/:idLoai/:idBai', async function (req, res, next) {

  var idLoai = req.params.idLoai;
  var idBai = req.params.idBai;

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
      if (data.Items.length !== 0) {
        let baiviet = data.Items[0];
        res.send(baiviet);
      }
    })
    .catch((err) => {
      res.render('file404');
    });

});
module.exports = router;
