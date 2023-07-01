from pymongo import MongoClient

mongo_host = "localhost"
mongo_port = 27017
mongo_db = "mydatabase"

client = MongoClient(mongo_host, mongo_port)
db = client[mongo_db]
collection = db["mycollection"]