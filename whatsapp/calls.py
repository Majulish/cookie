import requests
from cookie.secrets import TOKEN, INSTANCE_ID


def message_person(number: str, message: str):
    url = f"https://api.ultramsg.com/{INSTANCE_ID}/messages/chat"
    payload = f"token={TOKEN}&to=+{number}&body={message}"
    payload = payload.encode('utf8').decode('iso-8859-1')
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.request("POST", url, data=payload, headers=headers)
    return response


def get_last_bot_messages(limit: int = 10):
    url = f"https://api.ultramsg.com/{INSTANCE_ID}/messages"

    querystring = {
        "token": TOKEN,
        "page": 1,
        "limit": limit,
        "status": "all",
        "sort": "desc"
    }
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.request("GET", url, headers=headers, params=querystring)
    return response


def get_chats():
    url = f"https://api.ultramsg.com/{INSTANCE_ID}/chats"

    querystring = {
        "token": TOKEN
    }

    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.request("GET", url, headers=headers, params=querystring)
    return response


def get_groups():
    ''' this also gets phones of all group members '''
    url = f"https://api.ultramsg.com/{INSTANCE_ID}/groups"

    querystring = {
        "token": f"{TOKEN}"
    }
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.request("GET", url, headers=headers, params=querystring)
    return response


def new_method(number: str, message: str):
    url = f"https://api.ultramsg.com/{INSTANCE_ID}/chats"

    querystring = {
        "token": TOKEN
    }

    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.request("GET", url, headers=headers, params=querystring)
    return response



