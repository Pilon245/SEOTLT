import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Column, Connection, Repository } from 'typeorm';
import { Component } from './component.entity';
import { v4 as uuidv4 } from 'uuid';

export interface Item {
  id: string;
  level: number;
  parent_id: string | null;
  name_no_mds: string | null;
  name_from_relation: string | null;
  mds_id: string | null;
  ref_id: number | null;
  quantity: number;
  weight: number;
  portion: number;
  name: string;
  nodetype: string;
  nodepropstype: string;
  tree_id: string;
  children?: Item[];
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Component)
    private componentRepository: Repository<Component>,
    @InjectConnection()
    private connection: Connection,
  ) {}

  async createMds(obj: { mds: Array<object> }) {
    const mds = this.disassemble(obj.mds);
    for (const created of mds) {
      try {
        await this.connection.query(
          `INSERT INTO component (id, level, parent_id, name_no_mds, name_from_relation, mds_id, ref_id, tree_id,
                       name, nodetype, nodepropstype, quantity, weight, portion)
            VALUES ('${created.id}', '${created.level}', '${created.parent_id}', '${created.name_no_mds}',
                    '${created.name_from_relation ? created.name_from_relation : null}',
                    '${created.mds_id ? created.mds_id : null}',
                    ${created.ref_id ? `'${created.ref_id}'` : null}, '${created.tree_id}',
                    '${created.name ? created.name : null}',
                    '${created.nodetype ? created.nodetype : null}',
                    '${created.nodepropstype ? created.nodepropstype : null}',
                    '${created.quantity ? created.quantity : null}',
                    '${created.weight ? created.weight : null}',
                    '${created.portion ? created.portion : null}')`,
        );
      } catch (e) {
        console.log('e', e);
      }
    }
  }
  async getChange(obj: { mds: Array<object> }) {
    const mds = this.disassemble(obj.mds);
    const updatesMds = mds.filter((item) => item.statusChange === 'update');
    const deleteMds = mds.filter((item) => item.statusChange === 'delete');
    for (const update of updatesMds) {
      await this.componentRepository.update(update.id, {
        level: update.level,
        parent_id: update.parent_id,
        name_no_mds: update.name_no_mds,
        name_from_relation: update.name_from_relation,
        mds_id: update.mds_id,
        ref_id: update.ref_id,
        quantity: update.quantity,
        weight: update.weight,
        portion: update.portion,
        tree_id: update.tree_id,
        name: update.name,
        nodetype: update.nodetype,
        nodepropstype: update.nodepropstype,
      });
    }
    for (const deleted of deleteMds) {
      const node = await this.componentRepository.findOneBy({ id: deleted.id });
      if (node.level === 1) {
        const related_node = await this.componentRepository.findBy({
          mds_id: node.tree_id,
        });
        for (const item of related_node) {
          await this.componentRepository.update(item.id, {
            mds_id: null,
          });
        }
      }
      await this.connection.query(`
      WITH RECURSIVE tree AS (
    SELECT id
    FROM component
    WHERE id = '${deleted.id}'

    UNION ALL

    SELECT t.id
    FROM component t
             INNER JOIN tree tr ON t.parent_id = tr.id
    )
    DELETE FROM component
    WHERE id IN (SELECT id FROM tree);`);
      // await this.componentRepository.delete(deleted.id);
    }
  }

  async getMdsById(id = '0b5b772f-f780-40f5-8802-b3b539fc1e0e') {
    const result = await this.connection.query(
      `WITH RECURSIVE node_links AS (
    SELECT n.*
    FROM component n
    WHERE n.tree_id = '${id}'

    UNION ALL

    SELECT DISTINCT n.*
    FROM component n
             INNER JOIN node_links nl ON n.tree_id = nl.mds_id
    )
        SELECT DISTINCT *
        FROM node_links;`,
    );
    const hierarchicalData = this.buildHierarchy(result);
    const oneMds = hierarchicalData.filter(
      (elem) => elem.tree_id === id && elem.level === 1,
    );
    const mds = await this.connection.query(`
              SELECT * FROM mds m
            INNER JOIN supplier ON supplier.id = m.supplier_id
--             INNER JOIN contact_person ON contact_person.supplier_id = supplier.id
            WHERE m.id = '${id}'`);
    return { mds: mds, tree: oneMds };
  }
  async getMds() {
    const result = await this.connection.query(
      `WITH RECURSIVE node_links AS (
    SELECT n.*
    FROM component n

    UNION ALL

    SELECT DISTINCT n.*
    FROM component n
             INNER JOIN node_links nl ON n.tree_id = nl.mds_id
    )
        SELECT DISTINCT *
        FROM node_links;`,
    );
    const hierarchicalData = this.buildHierarchy(result);
    return { mds: hierarchicalData };
  }
  buildHierarchy(data: Item[]): Item[] {
    const tree: Item[] = [];
    const lookup: { [key: number]: Item } = {};

    data.forEach((item) => {
      lookup[item.id] = { ...item, children: [] };
    });

    data.forEach((item) => {
      if (item.parent_id === null) {
        tree.push(lookup[item.id]);
      } else {
        lookup[item.parent_id]?.children?.push(lookup[item.id]);
      }
    });
    function recursiveSearch(node) {
      if (node.mds_id !== null && node.children.length === 0) {
        const arr = tree.filter((elem) => elem.tree_id === node.mds_id);
        if (arr[0]?.children) {
          node.children?.push(...arr[0]?.children);
        }
      }
      if (node.children) {
        node.children.forEach((child) => recursiveSearch(child));
      }
    }

    tree.forEach((item) => recursiveSearch(item));

    return tree;
  }

  disassemble(data) {
    let result = [];
    data.forEach((item) => {
      const newItem = {
        id: item.id,
        level: item.level,
        parent_id: item.parent_id,
        name_no_mds: item.name_no_mds,
        name_from_relation: item.name_from_relation,
        mds_id: item.mds_id,
        ref_id: item.ref_id,
        tree_id: item.tree_id,
        statusChange: item.statusChange ? item.statusChange : null,
        quantity: item.quantity ? item.quantity : null,
        weight: item.weight ? item.weight : null,
        portion: item.portion ? item.portion : null,
        name: item.name ? item.name : null,
        nodetype: item.nodetype ? item.nodetype : null,
        nodepropstype: item.nodepropstype ? item.nodepropstype : null,
      };
      result.push(newItem);
      if (item.children && item.children.length > 0) {
        result = result.concat(this.disassemble(item.children));
      }
    });
    return result;
  }
}
