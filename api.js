const db = require("./db");

const { 
    GetItemCommand, 
    PutItemCommand, 
    DeleteItemCommand, 
    ScanCommand, 
    UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const createHoliday = async (event) => {
    const response = { statusCode: 201 };

    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall( body || { }),
        };

        const createResult = await db.send(new PutItemCommand(params));

        response.body = JSON.stringify({
            message: "Holiday created successfully!",
            createResult,
        });        
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create holiday!",
            errorMsg: error.message,
            errorStack: error.stack,
        });
    }

    return response;
}

const getHoliday = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            key: marshall({ id: event.pathParameters.id }),
        };

        const { Item } = await db.send(new GetItemCommand(params));

        console.log({ Item });
        response.body = JSON.stringify({
            message: "Holiday retrieved successfully!",
            data: (Item) ? unmarshall(Item) : { },
            rawData: Item,
        });
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get holiday!",
            errorMsg: error.message,
            errorStack: error.stack,
        });
    }

    return response;
}

const updateHoliday = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ id: event.pathParameters.id }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), { }),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), { })),
        }

        const updateResult = await db.send(new UpdateItemCommand(params));

        response.body = JSON.stringify({
            message: "Holiday updated successfully!",
            updateResult
        })
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to update holiday!",
            errorMsg: error.message,
            errorStack: error.stack,
        });
    }

    return response;
}

const deleteHoliday = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params  = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ id: event.pathParameters.id }),            
        }

        const deleteResult = await db.send(new DeleteItemCommand(params));

        response.body = JSON.stringify({
            message: "Holiday deleted successfully!",
            deleteResult,
        });
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete holiday!",
            errorMsg: error.message,
            errorStack: error.stack,
        });

        return response;
    }
}

const getAllHolidays = async (event) => {
    const response = { statusCode: 200 };

    try {
        const { Items } = await db.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));

        response.body = JSON.stringify({
            message: "All holidays retrieved successfully!",
            data: Items.map((item) => unmarshall(item)),
            Items,
        });
    } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get all holidays!",
            errorMsg: error.message,
            errorStack: error.stack,
        });
    }

    return response;
}

module.exports = {
    getHoliday,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    getAllHolidays,
};