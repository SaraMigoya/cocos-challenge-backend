import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Instrument } from './index';

@Entity()
export class MarketData {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Instrument, instrument => instrument.marketData)
    instrument!: Instrument;

    @Column('decimal', { precision: 10, scale: 2 })
    high!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    low!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    open!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    close!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    previousClose!: number;

    @Column()
    datetime!: Date;
}
