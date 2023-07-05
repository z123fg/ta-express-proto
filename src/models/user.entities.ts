import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from "typeorm";
import { Room } from "./room.entities";
import { SessionDescription } from "./sessionDescription.entities";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

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

    @OneToMany(() => SessionDescription, (sessionDescription) => sessionDescription.owner)
    ownerSessionDescription: SessionDescription[];

    @OneToMany(() => SessionDescription, (sessionDescription) => sessionDescription.target)
    targetSessionDescription: SessionDescription[];
}
