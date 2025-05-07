# Galaxy Client API Demo

This is a minimal example showing how to use the Galaxy Client API to list tools from a Galaxy instance.

## Prerequisites

- Node.js 16 or higher
- A running Galaxy instance

## Installation

Install the dependencies:

```bash
npm install
```

This will install the `@galaxyproject/client-api` from the local directory.

## Usage

Run the example:

```bash
npm start
```

By default, it connects to `http://localhost:8080`. To use a different Galaxy instance:

```bash
npm start -- https://usegalaxy.org
```

## What It Does

This simple demo:

1. Creates a Galaxy API client
2. Fetches all available tools
3. Groups and displays tools by section
4. Fetches detailed information for a specific tool

## API Used

The demo uses these endpoints:

- `GET /api/tools` - List all tools
- `GET /api/tools/{tool_id}` - Get details for a specific tool
