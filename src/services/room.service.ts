import { myDataSource } from "../db/db-resource";
import { Room } from "../models/room.entities";
import { User } from "../models/user.entities";

export const getRooms = async () => {
    const rooms = await myDataSource.getRepository(Room).find({
        select: {
            id: true,
            roomName: true,
        },
        relations: {
            owner: true,
            history: true,
            users: true,
        },
    });
    //console.log("rooms", rooms);
    return rooms;
};

export const createRoom = async (roomName: string, ownerId: string) => {
    const userRepository = myDataSource.getRepository(User);

    const owner = await userRepository.findOneBy({ id: ownerId });
    const roomRepository = myDataSource.getRepository(Room);
    const room = roomRepository.create({
        roomName,
        owner,
        users: [],
        history: [],
    });
    return roomRepository.insert(room);
};

export const removeRoom = async (roomId: string, userId: string) => {
    const roomRepository = myDataSource.getRepository(Room);
    const room = await roomRepository.findOne({
        where: {
            id: roomId,
        },
        relations: {
            owner: true,
        },
    });

    if (room.owner.id === userId) {
        await roomRepository.remove(room);
    } else {
        throw Error("user is not the owner!");
    }
};

export const joinRoom = async (roomName: string, userId: string) => {
    const userRepository = myDataSource.getRepository(User);
    const roomRepository = myDataSource.getRepository(Room);
    const targetRoom = await roomRepository.findOneBy({ roomName });
    if (!targetRoom) throw Error("coudln't find this room!");
    await userRepository.update({ id: userId }, { room: targetRoom });
};
