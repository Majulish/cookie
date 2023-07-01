from whatsapp.calls import message_person, new_method
from whatsapp.tasks import get_all_groups_id, send_message_to_groups
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse


def send_menu_message(to_phone_number):
    # Twilio Account SID and Auth Token
    account_sid = 'YOUR_TWILIO_ACCOUNT_SID'
    auth_token = 'YOUR_TWILIO_AUTH_TOKEN'

    # Create a Twilio client
    client = Client(account_sid, auth_token)

    # Create a WhatsApp message
    message = client.messages.create(
        from_='whatsapp:+YOUR_TWILIO_PHONE_NUMBER',
        body='Please select an option:',
        to='whatsapp:' + to_phone_number,
        provide_feedback=True
    )

    # Print the message SID
    print('Message SID:', message.sid)


def main():
    message = ''
    # send_message_to_groups(message)
    new_method("972509241256", "ello")


if __name__ == '__main__':
    main()
