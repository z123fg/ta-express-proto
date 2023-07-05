import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { User } from "./user.entities";
import { Room } from "./room.entities";

@Entity()
export class SessionDescription {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({type:"longtext"})
    sessionDescriptionString: string;

    @ManyToOne(() => User, user=>user.targetSessionDescription, {cascade:true})
    target: User;

    @ManyToOne(() => User, user=>user.ownerSessionDescription, {cascade:true})
    owner: User;
}
