declare global {
    namespace NodeJS {
        interface Global {
            Axer: AxerBot;
        }
    }
}

declare var global: global;
