import { Entity, Column, PrimaryGeneratedColumn,ManyToMany,
    JoinTable, } from "typeorm"
import { Room } from "./room.entities"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userName: string

    @Column()
    ICE: string

    @Column()
    lastLogin: Date

    @Column()
    lastActive: Date

    
    @ManyToMany(()=> Room)
    @JoinTable()
    rooms: Room[]



}