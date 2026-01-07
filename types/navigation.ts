export type Food = { id: string; name: string };

export type RootTabParamList = {
    Home: undefined;
};

export type RootStackParamList = {
    Main: undefined;
    AddModal: { data: Food[] } | undefined;
};

export type ModalStackParamList = {
    HomeMain: undefined;
    AddModal: { data: Food[] } | undefined;
};
