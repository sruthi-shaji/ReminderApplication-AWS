from flask import Flask, request, jsonify
import boto3
from boto3.dynamodb.conditions import Attr
import uuid
from datetime import datetime
from config import Config
from dotenv import load_dotenv
import os
from flask_cors import CORS

from io import BytesIO
import requests
import json


# load_dotenv()
def get_config_from_url():
    url = 'https://mxtcad22akeefp6dbx2nl2o4bi0wwrci.lambda-url.us-west-2.on.aws/'
    response = requests.get(url)
    if response.status_code == 200:
        config_data = response.json()
        secrets = json.loads(config_data["secrets"])
        return secrets
    else:
        raise Exception(f"Failed to retrieve configuration from {url}")

app = Flask(__name__)
config = get_config_from_url()

session = boto3.Session(
    aws_access_key_id=config['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=config['AWS_SECRET_ACCESS_KEY'],
    region_name=config['AWS_REGION']
    # aws_session_token=config['AWS_SESSION_TOKEN']
)

dynamodb = session.resource('dynamodb')
table = dynamodb.Table(config['DYNAMODB_TABLE_NAME'])

sns = session.client('sns')
s3_client = session.client('s3')
bucket_name = 'remindo-images-cloud'

# Configure CORS with specific origins
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})

@app.route('/signup', methods=['POST'])
def test():
    headers = request.headers
    form_data = request.form.to_dict()
    images = []

    for key in request.files:
        file = request.files[key]
        images.append({
            'filename': file.filename,
            'content': BytesIO(file.read())
        })

    try:
        new_username = form_data['username']
        new_password = form_data['password']
        new_email = form_data['email']

        # Check if the username already exists
        response = table.scan(FilterExpression=Attr('username').eq(new_username))
        if response['Items']:
            return jsonify({'message': 'Username already exists'}), 400

        topic_name = f"{new_username}_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}"
        created_topic = sns.create_topic(Name=topic_name)
        created_arn = created_topic['TopicArn']

        # Generate a new userId
        new_user_id = str(uuid.uuid4())

        # Create a new user in the database
        table.put_item(Item={
            'userId': new_user_id,
            'username': new_username,
            'password': new_password,
            'email': new_email,
            'reminder_list': [],
            'arn': created_arn
        })

        subscribe_to_topic(new_email, created_arn)
        send_notification(new_username, created_arn)

        for image in images:
            file_extension = os.path.splitext(image['filename'])[1]
            s3_key = f"{new_user_id}/{str(uuid.uuid4())}{file_extension}"
            s3_client.upload_fileobj(image['content'], bucket_name, s3_key)

        return jsonify({'message': 'User created successfully'}), 200
    except Exception as ex:
        print(ex)
        return jsonify({'error': f'Error creating user: {str(ex)}'}), 500

def subscribe_to_topic(email, created_arn):
    # Subscribe the user's email address to the SNS topic
    sns.subscribe(
        TopicArn=created_arn,
        Protocol='email',
        Endpoint=email
    )

def send_notification(name, created_arn):
    # Send notification email using Amazon SNS
    message = "Welcome to Remindo"
    subject = f"Welcome to Remindo, {name}!! Have a good day!!"
    
    sns.publish(
        TopicArn=created_arn,
        Message=message,
        Subject=subject,
    )


@app.route('/login', methods=['POST'])
def login():
    event_body = request.get_json()

    username = event_body.get('username')
    password = event_body.get('password')

    # Query DynamoDB to check if the username exists and password matches
    response = table.scan(FilterExpression=Attr('username').eq(username) & Attr('password').eq(password))
    items = response['Items']
    if items:
        user_id = items[0]['userId']
        email = items[0]['email']
        reminders = items[0]['reminder_list']
        return jsonify({'user_id': user_id}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401

@app.route('/user', methods=['POST'])
def fetch_user():
    try:
        event_body = request.get_json()
        user_id = event_body.get('user_id')

        # Retrieve specific user details from DynamoDB
        response = table.get_item(Key={'userId': user_id})
        item = response.get('Item')

        if not item:
            return jsonify({'message': 'User not found'}), 404

        return jsonify({
            'username': item.get('username'),
            'email': item.get('email'),
            'reminder_list': item.get('reminder_list')
        }), 200

    except Exception as e:
        # Log any unexpected errors
        print(f'Error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/reminder', methods=['POST'])
def add_reminder():
    try:
        event_body = request.get_json()
        user_id = event_body.get('user_id')
        new_title = event_body.get('title')
        new_description = event_body.get('description')
        new_date = event_body.get('date')

        # Generate a new unique ID for the reminder log
        new_reminder_id = str(uuid.uuid4())

        # Get existing reminder logs for the specified user
        response = table.get_item(Key={'userId': user_id})
        if 'Item' in response:
            reminder_info = response['Item'].get('reminder_list', [])
            # Append the new reminder log to the existing reminder_list array
            reminder_info.append({'id': new_reminder_id, 'title': new_title, 'description': new_description, 'date': new_date})
            # Update the reminder logs for the specified user in DynamoDB
            table.update_item(
                Key={'userId': user_id},
                UpdateExpression='SET reminder_list = :val',
                ExpressionAttributeValues={':val': reminder_info}
            )
            return jsonify({'message': 'Created new reminder!', 'reminder_id': new_reminder_id}), 200
        else:
            return jsonify({'message': 'User not found'}), 404

    except Exception as e:
        # Log any unexpected errors
        print(f'Error: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/reminder', methods=['PUT'])
def edit_reminder():
    try:
        event_body = request.get_json()
        user_id = event_body.get('user_id')
        reminder_id = event_body.get('reminder_id')

        # Extract new_name and new_date from the event
        new_title = event_body.get('title')
        new_description = event_body.get('description')
        new_date = event_body.get('date')

        # Retrieve reminder logs for the specified user
        response = table.get_item(Key={'userId': user_id})
        if 'Item' in response:
            reminder_info = response['Item'].get('reminder_list', [])
            for reminder in reminder_info:
                if reminder['id'] == reminder_id:
                    # Update the specific reminder log
                    reminder['title'] = new_title
                    reminder['description'] = new_description
                    reminder['date'] = new_date

                    # Update reminder logs for the specified user in DynamoDB
                    table.update_item(
                        Key={'userId': user_id},
                        UpdateExpression='SET reminder_list = :val',
                        ExpressionAttributeValues={':val': reminder_info}
                    )
                    return jsonify({'message': 'reminder updated successfully'}), 200
            return jsonify({'message': 'reminder not found'}), 404
        else:
            return jsonify({'message': 'User not found'}), 404

    except Exception as e:
        # Log any unexpected errors
        print(f'Error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/reminder', methods=['DELETE'])
def delete_reminder():
    try:
        event_body = request.get_json()
        user_id = event_body.get('user_id')
        reminder_id = event_body.get('reminder_id')

        # Retrieve reminder logs for the specified user
        response = table.get_item(Key={'userId': user_id})
        if 'Item' in response:
            reminder_info = response['Item'].get('reminder_list', [])
            for idx, reminder in enumerate(reminder_info):
                if reminder['id'] == reminder_id:
                    # Delete the specific reminder log
                    del reminder_info[idx]
                    # Update reminder logs for the specified user in DynamoDB
                    table.update_item(
                        Key={'userId': user_id},
                        UpdateExpression='SET reminder_list = :val',
                        ExpressionAttributeValues={':val': reminder_info}
                    )
                    return jsonify({'message': 'reminder deleted successfully'}), 200
            return jsonify({'message': 'reminder not found'}), 404
        else:
            return jsonify({'message': 'User not found'}), 404

    except Exception as e:
        # Log any unexpected errors
        print(f'Error: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/reminder/fetch', methods=['POST'])
def fetch_reminder():
    try:
        event_body = request.get_json()
        user_id = event_body.get('user_id')
        reminder_id = event_body.get('reminder_id')

        # Retrieve specific reminder log for the specified user
        response = table.get_item(Key={'userId': user_id})
        if 'Item' in response:
            reminder_info = response['Item'].get('reminder_list', [])
            for reminder in reminder_info:
                if reminder['id'] == reminder_id:
                    return jsonify(reminder), 200
            return jsonify({'message': 'reminder not found'}), 404
        else:
            return jsonify({'message': 'User not found'}), 404

    except Exception as e:
        # Log any unexpected errors
        print(f'Error: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000) 
   