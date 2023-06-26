from cookie.whatsapp.calls import get_groups
import json
import pandas as pd


def get_all_groups_to_csv():
    response = get_groups()

    json_data = json.load(response.content)
    data = json.loads(json_data)
    group_ids = [group['id'] for group in data]
    df = pd.DataFrame({'group_id': group_ids})
    csv_data = df.to_csv(index=False)

    return csv_data


def get_all_groups_to_json():
    response = get_groups()
    json_data = json.load(response.content)
    data = json.loads(json_data)
    group_ids_data = {}

    for group in data:
        group_id = group['id']
        participant_ids = [participant['id'] for participant in group['groupMetadata']['participants']]
        group_ids_data[group_id] = participant_ids

    json_group_ids_data = json.dumps(group_ids_data)

    return json_group_ids_data
