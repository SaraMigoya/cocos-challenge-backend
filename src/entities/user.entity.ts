import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './index';

@Entity({ name: 'users' }) export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    email!: string;

    @Column({ name: 'accountnumber', nullable: true })
    accountNumber!: string;

    @OneToMany(() => Order, order => order.user)
    orders!: Order[];
}
