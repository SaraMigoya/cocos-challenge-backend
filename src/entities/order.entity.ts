import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User, Instrument } from './index';

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.orders)
    @JoinColumn({ name: 'userid' }) // Especificas el nombre de la columna si es necesario
    user!: User;

    @ManyToOne(() => Instrument, instrument => instrument.orders)
    instrument!: Instrument;

    @Column({ nullable: true })
    side!: string;

    @Column('int')
    size!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    price!: number;

    @Column({ nullable: true })
    type!: string;

    @Column({ nullable: true })
    status!: string;

    @Column({ nullable: true })
    datetime!: Date;
}
