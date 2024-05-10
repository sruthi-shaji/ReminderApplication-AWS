import boto3
import json

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('BirthdayInfo')

sns = boto3.client('sns', region_name='us-east-1')
sns_topic_arn = 'arn:aws:sns:us-east-1:058264398252:BirthDayWisher'

def lambda_handler(event, context):
    try:
        if 'body' in event:
            event_body = json.loads(event['body'])
        else:
            # Handle event from other sources
            event_body = event
        # Extract the user_id from the event
        user_id = event_body.get('user_id')

        # Check if the user exists
        response = table.get_item(Key={'userId': user_id})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'User not found'})
            }
        user_email = response['Item']['email']
        user_arn = response['Item']['arn']

        # Delete the user from the DynamoDB table
        table.delete_item(Key={'userId': user_id})
        unsubscribe_from_topic(sns_topic_arn,user_email)
        unsubscribe_from_topic(user_arn , user_email)
        response = sns.delete_topic(
            TopicArn=user_arn
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User deleted successfully'})
        }
    except Exception as e:
        # Log any unexpected errors
        print(f'Error: {e}')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def unsubscribe_from_topic(sns_topic_arn, email):
    # Retrieve the list of subscriptions for the given topic
    response = sns.list_subscriptions_by_topic(
        TopicArn=sns_topic_arn
    )
    
    for subscription in response['Subscriptions']:
        if subscription['Protocol'] == 'email' and subscription['Endpoint'] == email:
            if subscription['SubscriptionArn'] != 'PendingConfirmation':
                # Unsubscribe the user from the topic
                sns.unsubscribe(
                    SubscriptionArn=subscription['SubscriptionArn']
                )
                print(f"Unsubscribed {email} from the topic")
            break