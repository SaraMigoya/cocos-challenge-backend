import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User, Instrument } from './index';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.orders)
    user!: User;

    @ManyToOne(() => Instrument, instrument => instrument.orders)
    instrument!: Instrument;

    @Column()
    side!: string;

    @Column('int')
    size!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    price!: number;

    @Column()
    type!: string;

    @Column()
    status!: string;

    @Column()
    datetime!: Date;
}
