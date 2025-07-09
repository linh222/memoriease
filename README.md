# MemoriEase

**MemoriEase** is an advanced lifelog retrieval system that helps users search, explore, and analyze lifelog data, including images, text, and metadata. Evolving through several years of research and competition at the Lifelog Search Challenge (LSC), MemoriEase integrates powerful retrieval techniques, a conversational interface, and a Retrieval-Augmented Generation (RAG) pipeline for question answering.

---

## ✨ Features

- **Text-to-Image and Image-to-Image Retrieval**  
  Find lifelog images by typing text queries or by example images.

- **Conversational Search**  
  Interact naturally with your lifelog via a chatbot interface powered by GPT-4o-mini.

- **Temporal Search**  
  Search for events happening before or after a given event, supporting lifelog timelines.

- **Rich Filters**  
  Refine search using filters for time, location, semantic concepts, OCR text, and more.

- **Retrieval-Augmented Generation (RAG)**  
  Answer complex natural-language questions about your lifelog, combining search results and language models for reasoning.

- **Scalable Indexing**  
  Efficient storage and retrieval of hundreds of thousands of lifelog images using Elasticsearch and vector embeddings.

---

## 🚀 Quick Start

> **Note**: Details here are generalized. Adjust paths, requirements, or commands for your implementation.

### Prerequisites

- Python 3.9+
- Elasticsearch (≥ 8.x)
- Node.js (if building frontend)
- Docker (optional)

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/memoriease.git
cd memoriease

```

Start front end:

```bash

cd frontend
npm install
npm run build
```
Start backend:

```bash
#Start elasticsearch and indexing

cd memoriease_backend
pip install -r requirements.txt

python3 app/ingest_data/app/ingest_data/ingest_data_no_segmentation.py

uvicorn app.main:app --reload
```