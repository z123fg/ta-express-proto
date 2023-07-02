import { Entity, Column, PrimaryGeneratedColumn,ManyToMany,
    JoinTable,
    OneToMany,
    ManyToOne, } from "typeorm"
import { Room } from "./room.entities"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: string

    @Column({unique:true})
    userName: string

    @Column()
    ICE: string

    @Column({nullable:true})
    lastLogin: string

    @Column({nullable:true})
    lastActive: string

    @OneToMany(()=>Room, room=> room.owner)
    createdRooms: Room[]
    
    @ManyToOne(()=>Room, room=>room.users,{cascade:true})
    room: Room



}