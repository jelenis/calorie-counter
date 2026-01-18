import type { EmptyFoodEntry as PartialFoodEntry, Food } from '@utils/db';

export async function fetchSearchResults(query: string) {

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}?q=${encodeURIComponent(query)}`);
    if (response.ok) {
        const data = await response.json();
        if (!data) {
            return [];
        }
        return normalizedEntries(data);
    } else {
        throw new Error('Error fetching search results');
    }
}


function normalizedEntries(entries: any[]) {
    return entries.map(({ id, ...rest }) => (
        { ...rest, server_id: id, id: undefined }
    )) as PartialFoodEntry[];
}