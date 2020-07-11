const aws = require("aws-sdk");

aws.config.update({
    region : "us-east-1"
});

let dynamodb = new aws.DynamoDB();

let params = {
    TableName : "ThongBao",
    KeySchema : [
        {AttributeName : "email", KeyType : "HASH"},
        {AttributeName : "idLoaiThongBao", KeyType : "RANGE"}
    ],
    AttributeDefinitions :[
        {AttributeName : "email", AttributeType : "S"},
        {AttributeName : "idLoaiThongBao", AttributeType : "N"}
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