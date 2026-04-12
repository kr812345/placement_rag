from app.services.rag_service import retriever_instance
retriever_instance.load_db()
print('Total docs:', len(retriever_instance.documents))
doc = retriever_instance.documents[0]
print('Doc keys:', list(doc.keys()))
print('Metadata keys:', list(doc.get('metadata', {}).keys()))
print('role_id sample:', doc.get('metadata', {}).get('role_id'))
# Search for amazon
for d in retriever_instance.documents:
    meta = d.get('metadata', {})
    if 'amazon' in str(meta.get('role_id', '')):
        print('Found:', meta.get('role_id'))
