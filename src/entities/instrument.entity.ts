import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User, Order, MarketData } from './index';

@Entity()
export class Instrument {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    ticker!: string;

    @Column()
    name!: string;

    @Column()
    type!: string;

    @OneToMany(() => Order, order => order.instrument)
    orders!: Order[];

    @OneToMany(() => MarketData, marketData => marketData.instrument)
    marketData!: MarketData[];
}
