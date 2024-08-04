from flask import current_app as app


class User:
    @staticmethod
    def find_by_username(username):
        """
        Find a user by their username.
        :param username: The username to search for.
        :return: The user document if found, else None.
        """
        return app.db.users.find_one({"username": username})

    @staticmethod
    def create(user_data):
        """
        Create a new user.
        :param user_data: A dictionary containing the user's information.
        :return: The result of the insert operation.
        """
        return app.db.users.insert_one(user_data)

    @staticmethod
    def delete_by_username(username):
        """
        Delete a user by their username.
        :param username: The username to search for.
        :return: The result of the delete operation.
        """
        return app.db.users.delete_one({"username": username})
