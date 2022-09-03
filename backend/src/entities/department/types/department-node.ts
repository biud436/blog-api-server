export type DepartmentNode = {
    id: number;
    name: string;
    level: number;
    children?: DepartmentNode[];
};
