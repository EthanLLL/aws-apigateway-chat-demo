const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
      
exports.handler = async function (event, context) {
  // 数据库查询所有当前连接
  let connections;
  try {
    connections = await ddb.scan({ TableName: process.env.table }).promise();
    console.log(connections)
  } catch (err) {
    return {
      statusCode: 500,
    };
  }

  // 这个对象拿来发送消息
  const callbackAPI = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint:
      event.requestContext.domainName + '/' + event.requestContext.stage,
  });

  console.log(event)
  const data = JSON.parse(event.body)
  
  let msg2send
  
  if (data.type === 'message') {
    const { message, username, time, room, type } = data
    msg2send = JSON.stringify({
      type: type,
      text: message,
      username: username,
      time: time,
      room: room
    })
  } else if (data.type === 'user_in_room') {
    let roomObj;
    const { username, room, type } = data 

    roomObj = await ddb.get({ 
      TableName: process.env.roomTable,
      Key: {
        id: room
      }
    }).promise();
    let users = roomObj.Item.users
    if (!users.includes(username)) {
      users.push(username)
    }

    const res = await ddb.put({
      TableName: process.env.roomTable,
      Item: {
        id: room,
        users: users
      }
    }).promise();

    msg2send = JSON.stringify({
      type: type,
      users: users,
      room: room
    })
  }

  // 将消息发送至所有连接客户端
  const sendMessages = connections.Items.map(async ({ connectionId }) => {
    try {
      await callbackAPI
        .postToConnection({ ConnectionId: connectionId, Data: msg2send })
        .promise();
    } catch (e) {
      console.log(e);
    }
  });

  try {
    await Promise.all(sendMessages);
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }

  return { statusCode: 200 };
};