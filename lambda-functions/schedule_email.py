import boto3
import logging
from datetime import datetime, timedelta, timezone

# Initialize SNS client
sns = boto3.client('sns', region_name='us-east-1')
sns_topic_arn = 'arn:aws:sns:us-east-1:058264398252:BirthDayWisher'

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('BirthdayInfo')

local_tz_offset = timedelta(hours=-5)

def lambda_handler(event, context):
    try:
        # Retrieve user data from your data source (e.g., DynamoDB)
        users = get_user_data()
        # Get current date
        current_utc_time = datetime.now(timezone.utc)
        current_local_time = current_utc_time + local_tz_offset
        current_date = current_local_time.strftime('%d-%m')
        listArns = []
        for user in users:
            email = user['email']
            arn = user['arn']
            birthday_list = user['birthday_list']

            # Check if user has birthday events today
            for birthday in birthday_list:
                birthday_date = datetime.strptime(birthday['date'], '%d-%m-%Y').strftime('%d-%m')
                if birthday_date == current_date:
                    listArns.append({'name': birthday['name'],'arn': arn,'subject':f"{birthday['name']}'s Birthday!",'message': f"Its{birthday['name']}'s birthday today !! Wish them Happy Birthday!"})
            
        return {'statusCode': 200,'body': {'message': 'Birthday notifications sent successfully', 'arns' : listArns}}
    except Exception as e:
       logging.error(f"An error occurred: {e}") 
       return {
            'statusCode': 500,
            'body': {'error': 'An error occurred'}
        }

def get_user_data():
    try:
        # Fetch user data from DynamoDB table
        response = table.scan()
        items = response['Items']
        return items
    except Exception as e:
        logging.error(f"Error fetching user data: {e}")
        return []
