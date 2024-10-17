import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order, MarketData } from './index';

@Entity({ name: 'instruments' })
export class Instrument {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    ticker!: string;

    @Column({ nullable: true })
    name!: string;

    @Column({ nullable: true })
    type!: string;


    @OneToMany(() => Order, order => order.instrument)
    orders!: Order[];
    marketData: any;
}
