const aws = require("aws-sdk");
const fs = require("fs");

aws.config.update({
    region : "us-east-1"
});

let duLieu = JSON.parse(fs.readFileSync("./baidang.json","utf8"));

let docClient = new aws.DynamoDB.DocumentClient();

duLieu.forEach((item) => {
    let params = {
        TableName : "BaiDang",
        Item : {
            "idLoai" : item.idLoai,
            "idBai" : item.idBai,    
            "email" : item.email,
            "date" : item.date,
            "time" : item.time,
            "hinhTieuDe" : item.hinhTieuDe,
            "tieuDe" : item.tieuDe,
            "noiDungTomTat" : item.noiDungTomTat,
            "tinhTrang" : item.tinhTrang,
            "noiDung" : item.noiDung,
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