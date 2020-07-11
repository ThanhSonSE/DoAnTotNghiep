const aws = require("aws-sdk");

aws.config.update({
    region : "us-east-1"
});

let dynamodb = new aws.DynamoDB();

let params = {
    TableName : "BaiDang",
    KeySchema : [
        {AttributeName : "idLoai", KeyType : "HASH"},
        {AttributeName : "idBai", KeyType : "RANGE"}
    ],
    AttributeDefinitions :[
        {AttributeName : "idLoai", AttributeType : "N"},
        {AttributeName : "idBai", AttributeType : "N"}
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