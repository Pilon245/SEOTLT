import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Component {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ nullable: true })
  name_no_mds: string;

  @Column({ nullable: true })
  name_from_relation: string;

  @Column({ nullable: true })
  mds_id: number;

  @Column({ nullable: true })
  ref_id: number;

  @Column()
  tree_id: number;
}
