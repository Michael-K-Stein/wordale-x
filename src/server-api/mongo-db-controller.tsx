import { Collection, Db, MongoClient } from "mongodb";
import { LastGameTimeData } from "@/server-api/enc";

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING ?? 'mongodb://localhost:27017/';


export interface DbUserData
{
    username: string;
    lastGameTime: LastGameTimeData;
}

class DatabaseController
{
    private mongoClient!: MongoClient;
    private showermusicDb!: Db;
    private _users!: Collection<DbUserData>;

    constructor()
    {
        this.mongoClient = new MongoClient(MONGO_CONNECTION_STRING);
        this.showermusicDb = this.mongoClient.db('wordale');
        this._users = this.showermusicDb.collection('users');
    }

    public get users(): Collection<DbUserData>
    {
        return this._users;
    }
}

const databaseController = new DatabaseController();
export default databaseController;


export type ProjectionMap<T> = {
    [ P in keyof T ]: 1;
};
