import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Component {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  level: number;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ nullable: true })
  name_no_mds: string;

  @Column({ nullable: true })
  name_from_relation: string;

  @Column({ nullable: true })
  mds_id: string;

  @Column({ nullable: true })
  ref_id: number;

  @Column()
  quantity: number;

  @Column()
  weight: number;

  @Column()
  portion: number;

  @Column()
  tree_id: string;

  @Column()
  name: string;

  @Column()
  nodetype: string;

  @Column()
  nodepropstype: string;
}
