const aws = require("aws-sdk");
const fs = require("fs");

aws.config.update({
    region : "us-east-1"
});

let duLieu = JSON.parse(fs.readFileSync("./baiviet.json","utf8"));

let docClient = new aws.DynamoDB.DocumentClient();

duLieu.forEach((item) => {
    let params = {
        TableName : "BaiViet",
        Item : {
            "idLoai" : item.idLoai,
            "email" : item.email,
            "idBai" : item.idBai,    
            "noiDung" : item.noiDung,
            "soKhieuNai" : item.soKhieuNai,
            "date" : item.date,
		    "time" : item.time,
            "tinhTrang" : item.tinhTrang,
            "nguoiThich" : item.nguoiThich,
            "binhLuan" : item.binhLuan
        }
    };

    docClient.put(params,(err,data)=>{
        if(err){
            console.error(`Thêm thất bại vì ${err}`);
        }else console.log(`Thêm thành công`);
    });
});