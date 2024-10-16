import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './index';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    accountNumber!: string;

    @OneToMany(() => Order, order => order.user)
    orders!: Order[];
}
