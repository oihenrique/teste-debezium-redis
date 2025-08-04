import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusCesta } from '../types/status.cesta.enum';

@Entity('cestas')
export class Cesta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  caixa_id: number;

  @Column({
    type: 'enum',
    enum: StatusCesta,
    default: StatusCesta.ABERTA,
  })
  status: StatusCesta;

  @CreateDateColumn({ type: 'timestamp', name: 'criado_em' })
  criado_em: Date;
}
