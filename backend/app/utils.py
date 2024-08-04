import re
from werkzeug.security import generate_password_hash, check_password_hash


def validate_input(username, password, email):
    """
    Validate the user input for registration.
    - Username, password, and email should not be empty.
    - Email should match the specified regex pattern.
    - Password should be at least 8 characters long.
    """
    email_regex = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    if not username or not password or not email:
        return False, "All fields are required"
    if not email_regex.match(email):
        return False, "Invalid email format"
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    return True, ""


def hash_password(password):
    """
    Hash the password using the SHA256 algorithm.
    """
    return generate_password_hash(password, method='pbkdf2:sha256')


def check_password(hashed_password, password):
    """
    Check the password against its hash.
    """
    return check_password_hash(hashed_password, password)
