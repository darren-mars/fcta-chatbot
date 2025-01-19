// This is just a helper to turn userSelections into a text-based query.
export function formatSelectionsForQuery(userSelections: any): string {
    let queryString = "";

    // For each top-level key in userSelections (like vibes, season, accommodation, activities)
    for (const selectionKey of Object.keys(userSelections)) {
        // userSelections[selectionKey] is an array of objects
        const selectionArray = userSelections[selectionKey];

        queryString += `\n=== ${selectionKey.toUpperCase()} ===\n`;

        selectionArray.forEach((item: any, index: number) => {
            const category = item.category ? `Category: ${item.category}\n` : "";
            const keywords = item.keywords?.length
                ? `Keywords: ${item.keywords.join(", ")}\n`
                : "";
            const notes = item.notes ? `Notes: ${item.notes}\n` : "";

            queryString += `Selection ${index + 1}:\n${category}${keywords}${notes}\n`;
        });
    }
    return queryString;
}
