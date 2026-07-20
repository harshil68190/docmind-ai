"""
RAG (Retrieval-Augmented Generation) pipeline.

This package implements the flow:

    chunking (splitter.py)
        -> embeddings (embedding.py)
        -> vector storage (vector_store.py)
        -> retrieval (retriever.py)
        -> prompt construction (prompts.py)
        -> generation (generator.py)
        -> citation formatting (citations.py)

`pipeline.py` composes all of the above into the single object the API
layer calls. Each module has exactly one responsibility and depends only
on the ones listed above it in this diagram — `embedding.py` doesn't know
`vector_store.py` exists, `vector_store.py` doesn't know `retriever.py`
exists, and so on. This is what keeps each piece independently testable
and swappable (e.g. FAISS -> a managed vector DB later touches only
`vector_store.py`).
"""
