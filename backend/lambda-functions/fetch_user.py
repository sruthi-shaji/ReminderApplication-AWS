import boto3
import json

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('BirthdayInfo')

def lambda_handler(event, context):
    try:
        if 'body' in event:
            event_body = json.loads(event['body'])
        else:
            # Handle event from other sources
            event_body = event
        # Extract the user_id from the event
        user_id = event_body.get('user_id')

        # Retrieve specific user details from DynamoDB
        response = table.get_item(Key={'userId': user_id})
        item = response.get('Item')

        if not item:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'User not found'})
            }

        return {
            'statusCode': 200,
            'body': json.dumps({
                'username': item.get('username'),
                'email' : item.get('email'),
                'birthday_list': item.get('birthday_list')
            })
        }
    except Exception as e:
        # Log any unexpected errors
        print(f'Error: {e}')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

