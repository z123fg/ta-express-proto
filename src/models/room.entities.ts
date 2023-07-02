import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
    ManyToOne,
} from "typeorm";
import { User } from "./user.entities";
import { History } from "./history.entities";

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({unique:true})
    roomName: string;

    @ManyToOne(()=> User, user=>user.createdRooms,{cascade:true})
    owner: User

    @OneToMany(() => User, user=>user.room)
    users: User[];

    @OneToMany(() => History, (history) => history.room)
    history: History[];
}
