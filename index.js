#!/usr/bin/env node

/**
 * Simple demo that shows how to use the Galaxy Client API
 * to list available tools from a Galaxy instance
 */

import { createGalaxyApi } from "@galaxyproject/galaxy-api-client";

// Get the Galaxy URL from command line or use default
const galaxyUrl = process.argv[2] || "http://localhost:8080";
// Get API key from command line (if provided)
const apiKey = process.argv[3];

// Create a standard Galaxy API client (without authentication)
const api = createGalaxyApi(galaxyUrl);

// Create an authenticated Galaxy API client (if API key is provided)
const authApi = apiKey
    ? createGalaxyApi({
          baseUrl: galaxyUrl,
          apiKey: apiKey,
          headers: {
              Accept: "application/json",
              "User-Agent": "GalaxyClientDemo/1.0",
          },
      })
    : null;

console.log(`Connecting to Galaxy at: ${galaxyUrl}`);
console.log(apiKey ? "Using authentication with provided API key" : "No API key provided, running in anonymous mode");

async function listTools() {
    try {
        // Fetch tools from the API
        const { data, error } = await api.GET("/api/tools");

        if (error) {
            console.error("Error fetching tools:", error);
            return;
        }

        if (!data || !Array.isArray(data)) {
            console.error("No tools data returned");
            return;
        }

        // Group tools by section
        const sections = {};
        for (const tool of data) {
            const section = tool.panel_section_name || "Ungrouped";
            if (!sections[section]) {
                sections[section] = [];
            }
            sections[section].push(tool);
        }

        // Print summary
        console.log(`\nFound ${data.length} tools in ${Object.keys(sections).length} sections\n`);

        // Print tool details by section
        for (const [section, tools] of Object.entries(sections)) {
            console.log(`## ${section} (${tools.length} tools)`);

            // Show the first 3 tools in each section
            for (const tool of tools.slice(0, 3)) {
                console.log(`- ${tool.name}: ${tool.id}`);
                console.log(`  Description: ${tool.description || "No description"}`);
            }

            // If more tools exist
            if (tools.length > 3) {
                console.log(`  ... and ${tools.length - 3} more tools`);
            }

            console.log("");
        }

        // Try to get details for a specific tool
        if (data.length > 0) {
            // Find a tool with a proper ID
            const toolWithId = data.find((tool) => tool.id && tool.id.includes("/"));

            if (toolWithId) {
                console.log(`\nFetching details for tool: ${toolWithId.name}`);
                console.log(`Tool ID: ${toolWithId.id}`);

                const { data: toolDetails, error: toolError } = await api.GET("/api/tools/{tool_id}", {
                    params: {
                        path: {
                            tool_id: toolWithId.id,
                        },
                    },
                });

                if (toolError) {
                    console.error("Error fetching tool details:", toolError);
                } else if (toolDetails) {
                    console.log("\nTool Details:");
                    console.log(`- Name: ${toolDetails.name}`);
                    console.log(`- Version: ${toolDetails.version}`);
                    console.log(`- Description: ${toolDetails.description || "No description"}`);
                }
            }
        }
    } catch (err) {
        console.error("Error in listTools:", err);
    }
}

async function getCurrentUser() {
    if (!authApi) {
        console.log("\nAuthentication required to fetch user information.");
        console.log("Run with API key: node index.js <galaxy-url> <api-key>");
        return null;
    }

    try {
        console.log("\nFetching current user information...");
        const { data, error } = await authApi.GET("/api/users/current");

        if (error) {
            console.error("Error fetching current user:", error);
            return null;
        }

        console.log("\nCurrent User Information:");
        console.log(`- Username: ${data.username}`);
        console.log(`- Email: ${data.email}`);
        console.log(`- Total disk usage: ${data.total_disk_usage}`);
        return data;
    } catch (err) {
        console.error("Error in getCurrentUser:", err);
        return null;
    }
}

async function getUserHistories() {
    if (!authApi) {
        console.log("\nAuthentication required to fetch histories.");
        console.log("Run with API key: node index.js <galaxy-url> <api-key>");
        return [];
    }

    try {
        console.log("\nFetching user histories...");
        const { data, error } = await authApi.GET("/api/histories", {
            params: {
                query: {
                    deleted: false,
                    published: false,
                },
            },
        });

        if (error) {
            console.error("Error fetching histories:", error);
            return [];
        }

        console.log(`\nFound ${data.length} histories:`);

        // Print summary of histories
        for (const history of data) {
            console.log(`\n## History: ${history.name}`);
            console.log(`- ID: ${history.id}`);
            console.log(`- Size: ${history.nice_size}`);
            console.log(`- State: ${history.state}`);
            console.log(`- Tags: ${history.tags.length > 0 ? history.tags.join(", ") : "None"}`);
        }

        return data;
    } catch (err) {
        console.error("Error in getUserHistories:", err);
        return [];
    }
}

// Run the demo
async function runDemo() {
    // First list tools (always works, even without authentication)
    await listTools();

    // If API key provided, run authenticated examples
    if (apiKey) {
        const user = await getCurrentUser();
        if (user) {
            await getUserHistories();
        }
    }
}

runDemo();
