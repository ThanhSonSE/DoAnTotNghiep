const aws = require("aws-sdk");
const fs = require("fs");

aws.config.update({
    region : "us-east-1"
});

let duLieu = JSON.parse(fs.readFileSync("./nguoidung.json","utf8"));

let docClient = new aws.DynamoDB.DocumentClient();

duLieu.forEach((item) => {
    let params = {
        TableName : "NguoiDung",
        Item : {
            "loaiTaiKhoan" : item.loaiTaiKhoan,
            "email" : item.email,    
            "password" : item.password,
            "soDienThoai" : item.soDienThoai,
            "tenNguoiDung" : item.tenNguoiDung,
            "hinhDaiDien" : item.hinhDaiDien,
            "tinhTrang" : item.tinhTrang,
            "thongBaoTinNhan" : item.thongBaoTinNhan,
            "thongBaoBaiViet" : item.thongBaoBaiViet,
            "thongBaoXoaBai" : item.thongBaoXoaBai
        }
    };

    docClient.put(params,(err,data)=>{
        if(err){
            console.error(`Thêm thất bại vì ${err}`);
        }else console.log(`Thêm thành công`);
    });
});