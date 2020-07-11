const aws = require("aws-sdk");
const fs = require("fs");

aws.config.update({
    region : "us-east-1"
});

let duLieu = JSON.parse(fs.readFileSync("./thongbao.json","utf8"));

let docClient = new aws.DynamoDB.DocumentClient();

duLieu.forEach((item) => {
    let params = {
        TableName : "ThongBao",
        Item : {
            "email" : item.email,
            "idLoaiThongBao" : item.idLoaiThongBao,    
            "thongBao" : item.thongBao,
            "thongBaoDaDoc" : item.thongBaoDaDoc
        }
    };

    docClient.put(params,(err,data)=>{
        if(err){
            console.error(`Thêm thất bại vì ${err}`);
        }else console.log(`Thêm thành công`);
    });
});