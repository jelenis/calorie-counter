import type { EmptyFoodEntry as PartialFoodEntry, Food } from '@utils/db';

import Constants from "expo-constants";
export async function fetchSearchResults(query: string) {
    // in development mode, return sample data
    // if (Constants.executionEnvironment == 'storeClient') {
    //     await new Promise(resolve => setTimeout(resolve, 500));
    //     return normalizedEntries(sampleFoodEntries);
    // }
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}?q=${encodeURIComponent(query)}`);
    if (response.ok) {
        const data = await response.json() as Food[];

        return normalizedEntries(data);
    } else {
        throw new Error('Error fetching search results');
    }
}


function normalizedEntries(entries: Food[]) {
    return entries.map(({ server_id, ...rest }) => (
        { ...rest, food_id: server_id }
    )) as PartialFoodEntry[];
}