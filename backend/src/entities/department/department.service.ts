import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { DepartmentNode } from './types/department-node';

@Injectable()
export class DepartmentService implements OnModuleInit {
    private logger: Logger = new Logger(DepartmentService.name);

    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) {}

    async onModuleInit() {
        // 가장 깊은 노드부터 삭제할 수 있게 위상 정렬 시작
        const items = await this.getTopologicalSortByLevel();

        if (items && items.length > 0) {
            for (const item of items) {
                await this.departmentRepository.delete({
                    id: item.id,
                });
            }
        }

        // AUTO_INCREMENT를 1로 재설정
        await this.departmentRepository.query(
            'ALTER TABLE department AUTO_INCREMENT = 1',
        );

        const models: Department[] = [];

        models.push(
            this.departmentRepository.create({
                name: '루트',
                level: 1,
                upperDepartmentId: null,
            }),
        );

        models.push(
            this.departmentRepository.create({
                name: '개발부',
                level: 2,
                upperDepartmentId: 1,
            }),
        );

        models.push(
            this.departmentRepository.create({
                name: '개발팀 1',
                level: 3,
                upperDepartmentId: 2,
            }),
        );
        models.push(
            this.departmentRepository.create({
                name: '개발팀 2',
                level: 3,
                upperDepartmentId: 2,
            }),
        );
        models.push(
            this.departmentRepository.create({
                name: '개발팀 3',
                level: 3,
                upperDepartmentId: 2,
            }),
        );

        models.push(
            this.departmentRepository.create({
                name: '마케팅부',
                level: 2,
                upperDepartmentId: 1,
            }),
        );

        models.push(
            this.departmentRepository.create({
                name: '마케팅팀 1',
                level: 3,
                upperDepartmentId: 6,
            }),
        );

        models.push(
            this.departmentRepository.create({
                name: '마케팅팀 2',
                level: 3,
                upperDepartmentId: 6,
            }),
        );

        models.push(
            this.departmentRepository.create({
                name: '마케팅팀 3',
                level: 3,
                upperDepartmentId: 6,
            }),
        );

        await this.departmentRepository.save(models);

        const children = this.getTree(await this.departmentRepository.find());

        this.logger.log(JSON.stringify(children, null, 2));

        console.log(
            JSON.stringify(await this.getTopologicalSortByLevel(), null, 2),
        );
    }

    /**
     * 깊이가 가장 깊은 노드부터 출력합니다.
     *
     * @returns
     */
    async getTopologicalSortByLevel() {
        const items = await this.departmentRepository
            .createQueryBuilder('department')
            .select()
            .getMany();

        const sortableItems = (await this.getTree(items)) as DepartmentNode[];

        const topologicalSort = (items: DepartmentNode[]) => {
            const sorted: DepartmentNode[] = [];
            const visited: DepartmentNode[] = [];

            const visit = (item: DepartmentNode) => {
                if (!item) {
                    return;
                }

                visited.push(item);

                item.children?.forEach((child) => {
                    visit(child);
                });

                sorted.push(item);
            };

            items.forEach((item) => {
                visit(item);
            });

            visited.sort((a, b) => a.level - b.level);

            return visited;
        };

        const sortedItems = topologicalSort(sortableItems).map((e) => {
            return {
                id: e.id,
                name: e.name,
                level: e.level,
            };
        });

        return sortedItems.reverse();
    }

    getTree(departments: Department[]) {
        const collection: Map<number, DepartmentNode[]> = new Map();
        const tree = [];

        departments.forEach((department) => {
            const node: DepartmentNode = {
                id: department.id,
                name: department.name,
                level: department.level,
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

        const traverse = (nodes: DepartmentNode[]) => {
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