import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cesta } from './cesta.entity';

@Entity('cesta_produtos')
export class CestaProduto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cesta_id: number;

  @Column()
  produto_id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  preco_unitario: number;

  @Column()
  quantidade: number;

  @ManyToOne(() => Cesta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cesta_id' })
  cesta: Cesta;
}
