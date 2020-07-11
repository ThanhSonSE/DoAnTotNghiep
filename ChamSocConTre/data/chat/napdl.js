const aws = require("aws-sdk");
const fs = require("fs");

aws.config.update({
    region : "us-east-1"
});

let duLieu = JSON.parse(fs.readFileSync("./chat.json","utf8"));

let docClient = new aws.DynamoDB.DocumentClient();

duLieu.forEach((item) => {
    let params = {
        TableName : "Chat",
        Item : {
            "emailNguoiChatA" : item.emailNguoiChatA,
            "emailNguoiChatB" : item.emailNguoiChatB,    
            "anhDaiDienNguoiA" : item.anhDaiDienNguoiA,
            "anhDaiDienNguoiB" : item.anhDaiDienNguoiB,
            "noiDungChat" : item.noiDungChat
        }
    };

    docClient.put(params,(err,data)=>{
        if(err){
            console.error(`Thêm thất bại vì ${err}`);
        }else console.log(`Thêm thành công`);
    });
});