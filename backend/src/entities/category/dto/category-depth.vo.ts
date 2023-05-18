export class CategoryDepthVO {
    left!: number;
    right!: number;
    name!: string;
    depth!: number;

    children: CategoryDepthVO[] = [];

    public addChild(child: CategoryDepthVO) {
        if (!this.children) {
            this.children = [];
        }

        this.children.push(child);
    }
}
