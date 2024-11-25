from werkzeug.security import generate_password_hash, check_password_hash


def hash_data(data: str) -> str:
    return generate_password_hash(data, method='pbkdf2:sha256')


def check_password(hashed_password: str, password: str) -> bool:
    return check_password_hash(hashed_password, password)

