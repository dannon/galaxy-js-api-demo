#!/usr/bin/env node

/**
 * Simple demo that shows how to use the Galaxy Client API
 * to list available tools from a Galaxy instance
 */

import { createGalaxyApi } from "@galaxyproject/client-api";

// Get the Galaxy URL from command line or use default
const galaxyUrl = process.argv[2] || "http://localhost:8080";

// Create a Galaxy API client
const api = createGalaxyApi(galaxyUrl);

console.log(`Connecting to Galaxy at: ${galaxyUrl}`);
console.log("Fetching tools...");

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

// Run the tool listing function
listTools();
