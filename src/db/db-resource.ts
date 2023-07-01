import { DataSource } from "typeorm"

export const myDataSource = new DataSource({
    type: "mysql",
    host: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "Jingn63z93!",
    database: "ta-webrtc",
    entities: ["src/models/*.ts"],
    logging: true,
    synchronize: true,
})