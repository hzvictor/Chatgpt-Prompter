export function willHaveCycle(graph: any, source: Node, target: Node): boolean {
    const preorder: Set<Node> = new Set();

    function dfs(origin: Node): boolean {
        if (preorder.has(origin)) return true;
        preorder.add(origin);
        for (const incoming of graph.getIncomingEdges(origin) ?? []) {
            const parent = incoming.getSourceNode();
            if (!parent) continue;
            if (dfs(parent)) return true;
        }
        preorder.delete(origin);
        return false;
    }

    preorder.add(target);
    return dfs(source);
}