import json
import base64
import boto3

client = boto3.client('s3')

filetypes = [
    'png',
    'jpeg'
]

def lambda_handler(event, context):
    match event['routeKey']:
        case 'GET /images/{folder}/{file}':
            response = client.get_object(
                Bucket = '2025-proyecto-integrador',
                Key = f"{event['pathParameters']['folder']}/{event['pathParameters']['file']}",
            )
            image_file_to_be_downloaded = response['Body'].read()
            image = f"data:image/{event['pathParameters']['file'].split(".")[1]};base64," + base64.b64encode(image_file_to_be_downloaded).decode()
            return {
                'statusCode': 200,
                'body': json.dumps({'data': image})
            }
        case 'POST /images':
            data = json.loads(event['body'])
            imageb64 = data['data']
            if "base64," in imageb64:
                imageb64 = imageb64.split(",")[1]
            # Add padding if necessary
            missing_padding = len(imageb64) % 4
            if missing_padding:
                imageb64 += '=' * (4 - missing_padding)

            ms = base64.b64decode(imageb64)
            filename, filetype = data['name'].split('.')
            for tipo in filetypes:
                response = client.delete_object(
                    Bucket = '2025-proyecto-integrador',
                    Key = f"{data['folder']}/{filename}.{tipo}",
                )
            response = client.put_object(
                Body = ms,
                Bucket = '2025-proyecto-integrador',
                Key = f"{data['folder']}/{filename}.{filetype}"
            )
            return {
                'statusCode': 200,
                'body': json.dumps('Image uploaded successfully')
            }
        case 'DELETE /images/{folder}/{file}':
            response = client.delete_object(
                    Bucket = '2025-proyecto-integrador',
                    Key = f"{event['pathParameters']['folder']}/{event['pathParameters']['file']}",
                )