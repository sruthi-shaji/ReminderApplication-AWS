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
        # Extract user_id and birthday_id from the event
        user_id = event_body.get('user_id')
        birthday_id = event_body.get('birthday_id')

        # Extract new_name and new_date from the event
        new_name = event_body.get('name')
        new_date = event_body.get('date')

        # Retrieve birthday logs for the specified user
        response = table.get_item(Key={'userId': user_id})
        if 'Item' in response:
            birthday_info = response['Item'].get('birthday_list', [])
            for birthday in birthday_info:
                if birthday['id'] == birthday_id:
                    # Update the specific birthday log
                    birthday['name'] = new_name
                    birthday['date'] = new_date

                    # Update birthday logs for the specified user in DynamoDB
                    table.update_item(
                        Key={'userId': user_id},
                        UpdateExpression='SET birthday_list = :val',
                        ExpressionAttributeValues={':val': birthday_info}
                    )
                    return {
                        'statusCode': 200,
                        'body': json.dumps({'message': 'Birthday updated successfully'})
                    }
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'Birthday not found'})
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

