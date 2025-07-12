import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "Noticias-Eventos";

export const handler = async (event) => {
  let body;
  let statusCode = '200';
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    switch (event.routeKey) {
      case "DELETE /noticiasYeventos/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /noticiasYeventos/{id}":
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = body.Item;
        break;
      case "GET /noticiasYeventos":
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = body.Items;
        break;
      case "PUT /noticiasYeventos":
        let putJSON = JSON.parse(event.body);
        let ids = await dynamo.send(
          new ScanCommand({
            TableName: tableName,
            ProjectionExpression: "id"
          })
        );
        let newId = ids.Count + 1
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: `${newId}`,
              descripcion: putJSON.descripcion,
              fecha: putJSON.fecha,
              resumen: putJSON.resumen,
              s3key: `noticiasYeventos/${newId}.${putJSON.s3key}`,
              titulo: putJSON.titulo,
              active: putJSON.active
            },
          })
        );
        body = newId;
        break;
      case "PATCH /noticiasYeventos/{id}":
        let patchJSON = JSON.parse(event.body);
        let updateExp = 'SET ';
        let expAttr = {};
        for (const key of Object.keys(patchJSON)) {
          updateExp = updateExp.concat(`${key} = :${key}, `);
          expAttr[`:${key}`] = patchJSON[key];
        }
        body = await dynamo.send(
          new UpdateCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
            UpdateExpression: updateExp.slice(0, -2),
            ExpressionAttributeValues: expAttr
          })
        );
        body = `Updated item ${event.pathParameters.id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
