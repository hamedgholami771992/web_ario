import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('providers')
@Unique(['name'])
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string; // API base URL or identifier

  @CreateDateColumn()
  createdAt: Date;
}
