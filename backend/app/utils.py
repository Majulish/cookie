from datetime import datetime


def combine_date_time(date: str, time: str) -> datetime:
    return datetime.strptime(f"{date} {time}", "%d/%m/%Y %M:%H")


def split_date_time(dt: datetime) -> tuple[str, str]:
    return dt.strftime("%d/%m/%Y"), dt.strftime("%M:%H")

