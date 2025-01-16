import { formatSelectionsForQuery } from "./formatSelections";

export async function sendUserSelectionsToRAG(
    userSelections: any, 
    oauthToken: string
) {
    try {
        // Convert userSelections to a single text query
        const query = formatSelectionsForQuery(userSelections);

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,          // The text from userSelections
                oauthToken
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error calling RAG API:", err);
        throw err;
    }
}
