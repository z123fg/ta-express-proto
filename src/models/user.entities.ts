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
    username: string

    @Column()
    password: string

    @Column({nullable:true})
    ICE: string

    @Column({nullable:true})
    lastLogin: string

    @Column({nullable:true})
    lastActive: string

    @Column()
    online: boolean

    @OneToMany(()=>Room, room=> room.owner)
    createdRooms: Room[]
    
    @ManyToOne(()=>Room, room=>room.users,{cascade:true})
    room: Room



}