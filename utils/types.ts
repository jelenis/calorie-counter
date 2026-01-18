export type Unit = 'serving' | 'g' | 'oz' | 'lb';
export const UNIT_TO_GRAMS: Record<string, number> = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592, ml: 1, l: 1000 };

import type { FoodEntry } from "../utils/db";


export type RootTabParamList = {
    Home: undefined;
    GoalScreen: undefined;
    CreateFoodScreen: undefined;
};

export type RootStackParamList = {
    Main: undefined;
    AddModal: { data: FoodEntry[] } | undefined;
};

export type ModalStackParamList = {
    HomeScreen: { foodEntry?: FoodEntry } | undefined;
    AddScreen: { dateStr: Date } | undefined;
    AboutScreen: undefined;
    OpenSourceData: undefined;
    ThirdPartyLicenses: undefined;
};
