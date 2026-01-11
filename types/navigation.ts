import type { FoodEntry } from "../utils/db";


export type RootTabParamList = {
    Home: undefined;
    GoalScreen: undefined;
};

export type RootStackParamList = {
    Main: undefined;
    AddModal: { data: FoodEntry[] } | undefined;
};

export type ModalStackParamList = {
    HomeScreen: { foodEntry?: FoodEntry } | undefined;
    AddScreen: { dateStr: Date } | undefined;
};
