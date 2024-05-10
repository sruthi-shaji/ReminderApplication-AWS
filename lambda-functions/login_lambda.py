import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('BirthdayInfo')

def lambda_handler(event, context):
    if 'body' in event:
        event_body = json.loads(event['body'])
    else:
        # Handle event from other sources
        event_body = event
    # Parse the request body
    username = event_body.get('username')
    password = event_body.get('password')

    # Query DynamoDB to check if the username exists and password matches
    response = table.scan(FilterExpression=Attr('username').eq(username) & Attr('password').eq(password))
    items = response['Items']
    if items:
        user_id = items[0]['userId']
        email = items[0]['email']
        birthdays = items[0]['birthday_list']
        return {
            'statusCode': 200,
            'body': json.dumps({'userId': user_id})
        }
    else:
        return {
            'statusCode': 401,
            'body': json.dumps({'message': 'Invalid username or password'})
        }

