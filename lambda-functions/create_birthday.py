import boto3
import json
import uuid

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
        # Extract values directly from the event
        user_id = event_body.get('user_id')
        new_name = event_body.get('name')
        new_date = event_body.get('date')

        # Generate a new unique ID for the birthday log
        new_birthday_id = str(uuid.uuid4())

        # Get existing birthday logs for the specified user
        response = table.get_item(Key={'userId': user_id})
        if 'Item' in response:
            birthday_info = response['Item'].get('birthday_list', [])
            # Append the new birthday log to the existing birthday_list array
            birthday_info.append({'id': new_birthday_id, 'name': new_name, 'date': new_date})
            # Update the birthday logs for the specified user in DynamoDB
            table.update_item(
                Key={'userId': user_id},
                UpdateExpression='SET birthday_list = :val',
                ExpressionAttributeValues={':val': birthday_info}
            )
            return {
                'statusCode': 201,
                'body': json.dumps({'message': 'Created new birthday!', 'birthdayId': new_birthday_id})
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'User not found'})
            }
    except Exception as e:
        # Log any unexpected errors
        print(f'Error: {e}')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

