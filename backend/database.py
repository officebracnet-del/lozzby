from pymongo import MongoClient

client = MongoClient(
    "mongodb+srv://admin:Tanvir01152008@cluster0.4unoodt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)

db = client["lozzby"]
products_collection = db["products"]