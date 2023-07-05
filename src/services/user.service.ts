import { In, IsNull, Not } from "typeorm";
import { myDataSource } from "../db/db-resource";
import { User } from "../models/user.entities";
import { SessionDescription } from "../models/sessionDescription.entities";

export const removeUser = async (userId: string) => {
    const userRepository = myDataSource.getRepository(User);
    return userRepository.delete(userId);
};

/* export const findOnlineUsers = async () => {
    const userRepository = myDataSource.getRepository(User);
    const users = await userRepository.find({
        select: {
            id: true,
            username: true,
            lastLogin: true,
            lastActive: true,
        },
        relations: {
            room: true,
        },
        where: {
            online: true,
        },
    });
    return users;
}; */

//for signup only
export const createUser = async (username: string, password: string) => {
    const userRepository = myDataSource.getRepository(User);
    const user = userRepository.create({ username, password });
    return userRepository.insert(user);
};

export interface ISessionDescriptionMap {
    [id: string]: string;
}

export const updateICE = async (userId: string, sessionDescriptionMap: ISessionDescriptionMap) => {
    const userRepository = myDataSource.getRepository(User);
    const SDRepository = myDataSource.getRepository(SessionDescription);
    const owner = await userRepository.findOneBy({ id: userId });
    await Promise.all(
        Object.entries(sessionDescriptionMap).map(([targetId, sessionDescriptionString]) => {
            return (async () => {
                const target = await userRepository.findOneBy({ id: targetId });
                const remoteICEs = SDRepository.create({ target, sessionDescriptionString, owner });
                await SDRepository.delete({ target, owner });
                await SDRepository.save(remoteICEs);
            })();
        })
    );

    return SDRepository.find({
        select: {
            sessionDescriptionString: true,
        },
        relations: {
            target: true,
            owner: true,
        },
    });
};

//for login only
export const findUser = async (username: string) => {
    const userRepository = myDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ username });
    return user;
};

export const quitRoom = async (userId: string) => {
    const userRepository = myDataSource.getRepository(User);
    //console.log("userId", userId);

    return userRepository.update({ id: userId }, { room: null });
};

export const syncOnlineUsers = async (ids: string[]) => {
    const userRepository = myDataSource.getRepository(User);
    await userRepository.update({ online: true }, { online: false });
    await userRepository.update({ id: In(ids) }, { online: true });
    return userRepository.find({
        where: { online: true },
        select: {
            id: true,
            username: true,
            lastLogin: true,
            lastActive: true,
        },
        relations: {
            room: true,
        },
    });
};

export const loginUser = async (userId: string) => {
    const userRepository = myDataSource.getRepository(User);

    await userRepository.update({ id: userId }, { online: true, lastLogin: new Date() });
};

export const logoffUser = async (userId: string) => {
    const userRepository = myDataSource.getRepository(User);
    const SDRepository = myDataSource.getRepository(SessionDescription);
    const user = await userRepository.findOneBy({ id: userId });
    const pendingSDs = await SDRepository.find({where: [{target:user},{owner: user}]});
    console.log("pending", user, pendingSDs)
    SDRepository.remove(pendingSDs)
    await userRepository.update(
        { id: userId },
        { online: false, room: null, lastActive: new Date() }
    );
};
