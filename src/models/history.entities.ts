import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { User } from "./user.entities";
import { Room } from "./room.entities";

@Entity()
export class History {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    entry: string;

    @Column()
    updateAt: string;

    @ManyToOne(() => Room, room=>room.history,{cascade:true})
    room: Room;
}
