import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Instrument } from './index';

@Entity({ name: 'marketdata' })
export class MarketData {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Instrument, instrument => instrument.marketData)
    @JoinColumn({ name: 'instrumentid' })
    instrument!: Instrument;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    high!: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    low!: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    open!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    close!: number;

    @Column('decimal', { precision: 10, scale: 2, name: 'previousclose' },)
    previousClose!: number;

    @Column({ name: 'date', nullable: true })
    date!: Date;
}
