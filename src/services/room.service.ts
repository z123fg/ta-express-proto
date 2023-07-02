import { myDataSource } from "../db/db-resource";
import { Room } from "../models/room.entities";
import { User } from "../models/user.entities";

export const getRooms = async () => {
    const rooms = await myDataSource.getRepository(Room).find();
    return rooms;
};

export const createRoom = async (roomName: string, ownerId: string) => {
    const userRepository = myDataSource.getRepository(User);

    const owner = await userRepository.findOneBy({ id: ownerId });
    console.log("owner", owner);
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
        where:{
            id: roomId
        },
        relations: {
            owner: true,
        },
    });

    if(room.owner.id === userId){
        roomRepository.remove(room)
    }else{
        throw Error("user is not the owner!")
    }
};

export const joinRoom = async (roomId: string, userId: string) => {
    const userRepository = myDataSource.getRepository(User);
    const roomRepository = myDataSource.getRepository(Room);

    const user = await userRepository.findOne({
        where: { id: userId },
        relations: { room: true },
    });

    const targetRoom = await roomRepository.findOneBy({ id: roomId });
    user.room = targetRoom;
    return userRepository.update(userId, user);
};
