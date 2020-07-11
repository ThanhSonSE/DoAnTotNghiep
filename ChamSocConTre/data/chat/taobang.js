const aws = require("aws-sdk");

aws.config.update({
    region : "us-east-1"
});

let dynamodb = new aws.DynamoDB();

let params = {
    TableName : "Chat",
    KeySchema : [
        {AttributeName : "emailNguoiChatA", KeyType : "HASH"},
        {AttributeName : "emailNguoiChatB", KeyType : "RANGE"}
    ],
    AttributeDefinitions :[
        {AttributeName : "emailNguoiChatA", AttributeType : "S"},
        {AttributeName : "emailNguoiChatB", AttributeType : "S"}
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