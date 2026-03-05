from motor.motor_asyncio import AsyncIOMotorClient
from config import DatabaseSettings


class Database:
    client: AsyncIOMotorClient = None

    @classmethod
    def get_client(cls) -> AsyncIOMotorClient:
        return cls.client

    @classmethod
    async def connect_to_database(cls):
        MONGODB_URL = DatabaseSettings.MONGODB_URL
        cls.client = AsyncIOMotorClient(MONGODB_URL)

    @classmethod
    async def close_database_connection(cls):
        if cls.client:
            cls.client.close()

    @classmethod
    def get_db(cls):
        return cls.client.video_annotation

    @classmethod
    def get_projects_collection(cls):
        return cls.get_db().projects

    @classmethod
    def get_videos_collection(cls):
        return cls.get_db().videos

    @classmethod
    def get_transcripts_collection(cls):
        return cls.get_db().transcripts

    @classmethod
    def get_annotations_collection(cls):
        return cls.get_db().annotations


db = Database()
