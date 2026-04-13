# 異世界 Isekai Analyzer

Analyze isekai anime story beats and visualize how different isekai beginnings diverge and converge through an interactive flow graph.

## Features

- **Anime Title Search**: Search and validate anime titles against AniList
- **Isekai Classification**: AI-powered determination of whether an anime is isekai, with confidence scores
- **Story Beat Extraction**: Automatic extraction of key story beats (departure, transition, arrival, powers)
- **Interactive Flow Graph**: DAG visualization showing how isekai story patterns converge and diverge
- **Beat Taxonomy**: Structured categorization with user-extensible taxonomy
- **Seed Dataset**: Pre-analyzed dataset of 16 popular isekai titles

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Visualization**: React Flow for interactive DAG rendering
- **AI**: Azure OpenAI (GPT-4.1-mini) for classification and beat extraction
- **Data**: AniList GraphQL API for anime validation
- **Storage**: Local JSON file storage
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+
- Azure OpenAI API access

### Setup

```bash
cd app
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Azure OpenAI credentials

# Seed the database with pre-analyzed anime
npm run seed

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | Yes |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | Yes |
| `AZURE_OPENAI_DEPLOYMENT` | Model deployment name (default: `gpt-4.1-mini`) | No |
| `AZURE_OPENAI_API_VERSION` | API version (default: `2025-03-01-preview`) | No |
| `ISEKAI_DATA_DIR` | Custom data storage directory (default: `./data`) | No |

## Project Structure

```
app/
├── src/
│   ├── app/          # Next.js app router pages and API routes
│   ├── components/   # React components
│   ├── lib/          # Core libraries (storage, AniList, OpenAI)
│   └── types/        # TypeScript type definitions
├── scripts/          # Seed data generation
└── data/             # Local data storage (gitignored)
```

## Seed Dataset

The app ships with 16 pre-analyzed isekai titles including:
Sword Art Online, Re:ZERO, KONOSUBA, That Time I Got Reincarnated as a Slime, Overlord, The Rising of the Shield Hero, Mushoku Tensei, No Game No Life, Log Horizon, So I'm a Spider So What?, and more.
