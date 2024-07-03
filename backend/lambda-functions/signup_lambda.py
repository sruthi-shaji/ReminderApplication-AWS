import json
import boto3
from boto3.dynamodb.conditions import Attr
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('BirthdayInfo')

sns = boto3.client('sns', region_name='us-east-1')

def lambda_handler(event, context):
    if 'body' in event:
        event_body = json.loads(event['body'])
    else:
        # Handle event from other sources
        event_body = event
    
    new_username = event_body.get('username')
    new_password = event_body.get('password')
    new_email = event_body.get('email')

    # Check if the username already exists
    response = table.scan(FilterExpression=Attr('username').eq(new_username))
    if response['Items']:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Username already exists'})
        }
        
    topic_name = f"{new_username}_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}"
    created_topic = sns.create_topic( Name= topic_name )
    created_arn = created_topic['TopicArn']

    # Generate a new userId
    new_user_id = str(uuid.uuid4())

    # Create a new user in the database
    table.put_item(Item={
                        'userId': new_user_id, 
                        'username': new_username, 
                        'password': new_password, 
                        'email' : new_email,
                        'birthday_list': [],
                        'arn' : created_arn
                        })
    subscribe_to_topic(new_email, created_arn)
    send_notification(new_username, created_arn)

    return {
        'statusCode': 201,
        'body': json.dumps({'message': 'User created successfully'})
    }

def subscribe_to_topic(email, created_arn):
    # Subscribe the user's email address to the SNS topic
    response = sns.subscribe(
        TopicArn=created_arn,
        Protocol='email',
        Endpoint=email
    )

def send_notification(name, created_arn):

    # Send notification email using Amazon SNS
    message = f"Welcome to BirthdayWisher"
    subject = f"Welcome to BirthdayWisher, {name}!! Have a good day!!"
    
    sns.publish(
        TopicArn=created_arn,
        Message=message,
        Subject=subject,
    )
