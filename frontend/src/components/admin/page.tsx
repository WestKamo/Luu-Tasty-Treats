const connection = createAdminHubConnection();
connection.on("OrderPaidUpdate", (payload: OrderPaidUpdatePayload) => { /* update feed */ });
connection.on("ReceiveNewOrder", (payload: ReceiveNewOrderPayload) => { /* update feed */ });
await connection.start();
