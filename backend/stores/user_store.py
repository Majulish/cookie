from backend.models.user import User


class UserStore:
    def create_user(self, username, email, password, role='worker'):
        user = User(username=username, email=email, password=password, role=role)
        user.save_to_db()
        return user

    def get_user(self, user_id):
        return User.find_by_id(user_id)

    def update_user(self, user_id, data):
        user = User.find_by_id(user_id)
        if user:
            for key, value in data.items():
                setattr(user, key, value)
            user.save_to_db()

    def delete_user(self, user_id):
        User.delete_by_id(user_id)

    def list_users(self):
        return User.query.all()

    def get_user_by_email(self, email):
        return User.find_by_email(email)

    def login(self, email, password):
        user = User.find_by_email(email)
        if user and user.check_password(password):
            return user
        return None

    def serialize_user(self, user):
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "role": user.role
        }
