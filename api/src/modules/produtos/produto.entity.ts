import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  preco: number;

  @Column({ unique: true })
  ean: string;
}
