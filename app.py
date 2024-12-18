from fastapi import FastAPI, WebSocket
from langchain_openai import AzureChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores.azuresearch import AzureSearch
from langchain.embeddings import AzureOpenAIEmbeddings
import json
import os

app = FastAPI()

# Initialize Azure OpenAI
llm = AzureChatOpenAI(
    openai_api_version="2024-02-15-preview",
    azure_deployment="gpt-4",  # Your deployment name
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY")
)

# Initialize embeddings
embeddings = AzureOpenAIEmbeddings(
    azure_deployment="text-embedding-ada-002",  # Your embedding deployment
    openai_api_version="2024-02-15-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY")
)

# Initialize Azure Cognitive Search
vector_store = AzureSearch(
    azure_search_endpoint=os.getenv("AZURE_SEARCH_ENDPOINT"),
    azure_search_key=os.getenv("AZURE_SEARCH_KEY"),
    index_name="your-index-name",
    embedding_function=embeddings
)

# Create RAG Chain
qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vector_store.as_retriever(),
    return_source_documents=True
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    chat_history = []
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            question = message.get("question", "")
            
            # Get response from RAG chain
            response = await qa_chain.ainvoke({
                "question": question,
                "chat_history": chat_history
            })
            
            # Format response
            answer = response["answer"]
            sources = [doc.page_content for doc in response.get("source_documents", [])]
            
            # Update chat history
            chat_history.append((question, answer))
            
            # Send response chunks
            for chunk in answer.split(". "):
                if chunk:
                    await websocket.send_json({
                        "chunk": chunk + "."
                    })
            
            await websocket.send_json({"end": True})
            
    except Exception as e:
        print(f"Error: {str(e)}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
