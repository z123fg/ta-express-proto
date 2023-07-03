import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from "typeorm";
import { Room } from "./room.entities";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    ICE: string;

    @Column({ nullable: true, type: "timestamp" })
    lastLogin: Date;

    @Column({ nullable: true, type: "timestamp" })
    lastActive: Date;

    @Column({ default: false })
    online: boolean;

    @OneToMany(() => Room, (room) => room.owner)
    createdRooms: Room[];

    @ManyToOne(() => Room, (room) => room.users, { cascade: true })
    room: Room;
}
