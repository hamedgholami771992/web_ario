import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('currencies')
@Unique(['name'])
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  name?: string;

  @Column({nullable: true})
  symbol?: string;

  @Column({nullable: true})
  description?: string;
}
