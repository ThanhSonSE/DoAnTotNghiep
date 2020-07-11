var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
let multer = require("multer");

const AWS = require('aws-sdk');

AWS.config.update({
    region : "us-east-1"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var urlencodeParser = bodyParser.urlencoded({ extended: false });

router.get('/', function (req, res, next) {
    var nd = req.cookies.nd;
    console.log(nd);
    res.render('capnhatthongtin', { nd: nd });
    console.log('Load xong');

});

router.post('/editThongTin', urlencodeParser, function (req, res, next) {

    var nd = req.cookies.nd;

    let loaiTaiKhoan = nd.loaiTaiKhoan;
    let email = nd.email;

    let tenNguoiDung = req.body.tenNguoiDung;
    let soDienThoai = req.body.soDienThoai;

    let newND = {
        "loaiTaiKhoan": nd.loaiTaiKhoan,
        "email": nd.email,
        "password": nd.password,
        "tenNguoiDung": tenNguoiDung,
        "soDienThoai": soDienThoai,
        "hinhDaiDien": nd.hinhDaiDien,
        "thongBaoBaiViet" : nd.thongBaoBaiViet,
        "thongBaoTinNhan" : nd.thongBaoTinNhan,
        "thongBaoXoaBai" : nd.thongBaoXoaBai
    }

    let table = "NguoiDung";

    let params = {
        TableName: table,
        Key: {
            "loaiTaiKhoan": Number(loaiTaiKhoan),
            "email": String(email)
        },
        UpdateExpression: "SET #ten = :tenNguoiDung, #sdt = :soDienThoai",
        ExpressionAttributeNames: {
            '#ten': 'tenNguoiDung',
            '#sdt': 'soDienThoai',
        },
        ExpressionAttributeValues: {
            ':tenNguoiDung': String(tenNguoiDung),
            ':soDienThoai': String(soDienThoai)
        },
        ReturnValues: 'UPDATED_NEW'
    };
    console.log('updating ....');
    docClient.update(params, (err, data) => {
        if (err) {
            res.send("Cập nhật lỗi... Vui lòng kiểm tra lại !!!")
        } else {
            res.cookie('nd', newND);
            res.send("Cập nhật thông tin thành công !!!");
        }
    });
});

router.post('/editMatKhau', urlencodeParser, function (req, res, next) {

    var nd = req.cookies.nd;

    let loaiTaiKhoan = nd.loaiTaiKhoan;
    let email = nd.email;

    let password = req.body.password;
    let passwordnew = req.body.passwordmoi;

    let newND = {
        "loaiTaiKhoan": nd.loaiTaiKhoan,
        "email": nd.email,
        "password": password,
        "tenNguoiDung": nd.tenNguoiDung,
        "soDienThoai": nd.soDienThoai,
        "hinhDaiDien": nd.hinhDaiDien,
        "thongBaoBaiViet" : nd.thongBaoBaiViet,
        "thongBaoTinNhan" : nd.thongBaoTinNhan,
        "thongBaoXoaBai" : nd.thongBaoXoaBai
    }

    if (password === nd.password) {
        let table = "NguoiDung";

        let params = {
            TableName: table,
            Key: {
                "loaiTaiKhoan": Number(loaiTaiKhoan),
                "email": String(email)
            },
            UpdateExpression: "SET #password = :password",
            ExpressionAttributeNames: {
                '#password': 'password',
            },
            ExpressionAttributeValues: {
                ':password': String(passwordnew)
            },
            ReturnValues: 'UPDATED_NEW'
        };
        console.log('updating ....');
        docClient.update(params, (err, data) => {
            if (err) {
                res.render('file404');
            } else {
                res.cookie('nd', newND);
                res.send("Cập nhật mật khẩu thành công!!!");
            }
        });
    } else {
        res.send("Mật khẩu cũ không đúng !!!");
    }
});

router.post('/editAnh', urlencodeParser, function (req, res, next) {

    uploadFile(req, res, (error) => {
        if (error) {
            return res.send(`Lỗi hình ảnh...Vui lòng kiểm tra lại!!!`);
        }
        var nd = req.cookies.nd;

        let loaiTaiKhoan = nd.loaiTaiKhoan;
        let email = nd.email;
        let hinhDaiDien = req.file.filename;
        console.log("Hình DD = " + hinhDaiDien);

        let newND = {
            "loaiTaiKhoan": nd.loaiTaiKhoan,
            "email": nd.email,
            "password": nd.password,
            "tenNguoiDung": nd.tenNguoiDung,
            "soDienThoai": nd.soDienThoai,
            "hinhDaiDien": hinhDaiDien,
            "thongBaoBaiViet" : nd.thongBaoBaiViet,
            "thongBaoTinNhan" : nd.thongBaoTinNhan,
            "thongBaoXoaBai" : nd.thongBaoXoaBai
        }

        let table = "NguoiDung";

        let params = {
            TableName: table,
            Key: {
                "loaiTaiKhoan": Number(loaiTaiKhoan),
                "email": String(email)
            },
            UpdateExpression: "SET #img = :hinhDaiDien",
            ExpressionAttributeNames: {
                '#img': 'hinhDaiDien'
            },
            ExpressionAttributeValues: {
                ':hinhDaiDien': String(hinhDaiDien)
            },
            ReturnValues: 'UPDATED_NEW'
        };
        console.log('updating ....');
        docClient.update(params, (err, data) => {
            if (err) {
                console.log('Loi update');
                console.error("Unable to update item. Error JSON: ", JSON.stringify(err, null, 2));
                res.render('file404');
            } else {
                res.cookie('nd', newND);
                res.send(hinhDaiDien);
                return;
            }
        });

    });

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
let uploadFile = multer({ storage: diskStorage }).single("file");

module.exports = router;