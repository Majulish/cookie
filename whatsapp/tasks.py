from whatsapp.calls import get_groups, message_person
import json
from secrets import GROUPS


def get_all_groups_to_json_phone_by_name():
    response = get_groups()
    json_data = response.json()
    groups_data = {}

    for group in json_data:
        group_name = group['name']
        participant_numbers = [participant['id'].split('@')[0] for participant in group['groupMetadata']['participants']]
        groups_data[group_name] = participant_numbers

    json_group_ids_data = json.dumps(groups_data)

    return json_group_ids_data


def get_all_groups_id():
    response = get_groups()
    json_data = response.json()
    groups_data = []

    for group in json_data:
        groups_data.append([group['id'], group['name']])

    return groups_data


def send_message_to_groups(message: str):
    for group in GROUPS:
        message_person(group[0], message=message)



