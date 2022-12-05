# aws-apigateway-chat-demo


## Backend

### Connect Handler
Api Gateway 将Connect请求路由至该Handler，代码中将Connect ID持久化存储

### Disconnect Handler
Api Gateway 将Disconnect请求路由至该Handler，代码中将Connect ID删除

### Send Message Handler
Api Gateway将对应请求路由至该Handler，代码中查询需要将消息发送至的客户端Connect ID，调用API Gateway的广播API，推送消息；

如果要将Message落地数据库、抛出业务事件等，也在该接口中实现。

### Default Handler
API Gateway默认路由

## Frontend

使用原生Websocket对象