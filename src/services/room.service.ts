import { myDataSource } from "../db/db-resource";
import { Room } from "../models/room.entities";
import { User } from "../models/user.entities";

export const getRooms = async () => {
    const rooms = await myDataSource.getRepository(Room).find();
    return rooms;
};

export const createRoom = async (roomName, ownerId) => {
  const userRepository = myDataSource.getRepository(User);

    const owner = await userRepository.findOneBy({id:ownerId});
    console.log("owner", owner)
    const roomRepository = myDataSource.getRepository(Room);
    const room = await roomRepository.create({
        roomName,
        owner,
        users: [],
        history: [],
    });
    return roomRepository.insert(room);
};

export const joinRoom = async (roomId, userId) => {
    const userRepository = myDataSource.getRepository(User);
    const roomRepository = myDataSource.getRepository(Room);

    const user = await userRepository.findOne({
        where: { id: userId },
        relations: { room: true },
    });

    const targetRoom = await roomRepository.findOneBy({id: roomId});
    user.room =targetRoom;
    return userRepository.update(userId, user);
};
