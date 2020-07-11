const aws = require("aws-sdk");

aws.config.update({
    region : "us-east-1"
});

let dynamodb = new aws.DynamoDB();

let params = {
    TableName : "NguoiDung",
    KeySchema : [
        {AttributeName : "loaiTaiKhoan", KeyType : "HASH"},
        {AttributeName : "email", KeyType : "RANGE"}
    ],
    AttributeDefinitions :[
        {AttributeName : "loaiTaiKhoan", AttributeType : "N"},
        {AttributeName : "email", AttributeType : "S"}
    ],
    ProvisionedThroughput : {
        ReadCapacityUnits : 10,
        WriteCapacityUnits : 10
    }
};

dynamodb.createTable(params,(err,data)=>{
    if(err){
        console.error(`Lỗi tạo ${err}`);
    }else console.log(`Tạo thành công`);
});