import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Department } from './entities/department.entity';

type Node = {
    id: number;
    name: string;
    children?: Node[];
};

@Injectable()
export class DepartmentService implements OnModuleInit {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) {}

    async onModuleInit() {
        // 모든 부서 삭제
        await this.departmentRepository.query(`
            DELETE FROM DEPARTMENT WHERE UPPER_DEPT_SQ IN (
                SELECT UPPER_DEPT_SQ FROM DEPARTMENT
            );
        `);

        await this.departmentRepository.query(`
            DELETE FROM DEPARTMENT;
        `);

        // AUTO_INCREMENT를 1로 재설정
        await this.departmentRepository.query(
            'ALTER TABLE department AUTO_INCREMENT = 1',
        );

        const models: Department[] = [];

        models.push(
            this.departmentRepository.create({
                name: '루트',
                upperDepartmentId: null,
            }),
        );

        models.push(
            this.departmentRepository.create({
                name: '개발부',
                upperDepartmentId: 1,
            }),
        );

        await this.departmentRepository.save(models);

        const children = this.getTree(await this.departmentRepository.find());

        console.log(JSON.stringify(children, null, 2));
    }

    getTree(departments: Department[]) {
        const collection: Map<number, Node[]> = new Map();
        const tree = [];

        departments.forEach((department) => {
            const node: Node = {
                id: department.id,
                name: department.name,
                children: [],
            };

            if (department.upperDepartmentId === null) {
                tree.push(node);
            } else {
                if (collection.has(department.upperDepartmentId)) {
                    collection.get(department.upperDepartmentId).push(node);
                } else {
                    collection.set(department.upperDepartmentId, [node]);
                }
            }
        });

        const traverse = (nodes: Node[]) => {
            nodes.forEach((node) => {
                if (collection.has(node.id)) {
                    node.children = collection.get(node.id);
                    traverse(node.children);
                }
            });
        };

        traverse(tree);

        return tree;
    }
}
