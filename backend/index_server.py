import os
from multiprocessing import Lock
from multiprocessing.managers import BaseManager
from llama_index.core import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    StorageContext,
    load_index_from_storage,
)

class IndexServer:
    def __init__(self):
        self.lock = Lock()
        self.index = None
        self.index_dir = "./.index"
        self.documents_dir = "./documents"
        self.storage_context = StorageContext.from_defaults(persist_dir=self.index_dir)
        self.initialize_index()

    def initialize_index(self):
        if os.path.exists(self.index_dir):
            
            self.index = load_index_from_storage(self.storage_context)
        else:
            documents = SimpleDirectoryReader(self.documents_dir).load_data()
            self.index = VectorStoreIndex.from_documents(
                documents, storage_context=self.storage_context
            )
            self.storage_context.persist(self.index_dir)

    def query_index(self, query_text):
        query_engine = self.index.as_query_engine()
        response = query_engine.query(query_text)
        return str(response)

    def insert_into_index(self, doc_text, doc_id=None):
        document = SimpleDirectoryReader(input_files=[doc_text]).load_data()[0]
        if doc_id is not None:
            document.doc_id = doc_id

        with self.lock:
            self.index.insert(document)
            self.index.storage_context.persist()
    
    def getIndex(self):
        return self.index

if __name__ == "__main__":
    # Initialize the index server
    print("Initializing index...")
    index_server = IndexServer()

    # Setup server
    # NOTE: you might want to handle the password in a less hardcoded way
    manager = BaseManager(('', 5602), b'password')
    manager.register('query_index', index_server.query_index)
    manager.register('insert_into_index', index_server.insert_into_index)
    server = manager.get_server()

    print("Starting server...")
    server.serve_forever()
