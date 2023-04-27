import { Snapline } from '@antv/x6-plugin-snapline';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { History } from '@antv/x6-plugin-history';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
export default (graph: any, container: any) => {
    graph
        .use(
            new Transform({
                resizing: true,
                rotating: true,
            }),
        )
        .use(
            new Selection({
                enabled: true,
                rubberband: true,
                showNodeSelectionBox: true,
                showEdgeSelectionBox: true,
                filter: (cell) => {
                    if (cell.getData() != undefined && cell.getData().disableSelect != undefined && !cell.getData().disableSelect) {
                        return false;
                    } else {
                        return true;
                    }
                },
            }),
        )
        .use(
            new Snapline({
                enabled: true,
            }),
        )
        .use(
            new Keyboard({
                enabled: true,
            }),
        )
        .use(
            new Clipboard({
                enabled: true,
            }),
        )
        .use(
            new History({
                enabled: true,
            }),
        );

    graph.bindKey(['meta+c', 'ctrl+c'], () => {
        const cells = graph.getSelectedCells();
        if (cells.length) {
            graph.copy(cells);
        }
        return false;
    });
    graph.bindKey(['meta+x', 'ctrl+x'], () => {
        const cells = graph.getSelectedCells();
        if (cells.length) {
            graph.cut(cells);
        }
        return false;
    });

    graph.bindKey(['meta+v', 'ctrl+v'], () => {
        if (!graph.isClipboardEmpty()) {
            const cells = graph.paste({ offset: 32 });
            graph.cleanSelection();
            graph.select(cells);
        }
        return false;
    });

    // undo redo
    graph.bindKey(['meta+z', 'ctrl+z'], () => {
        if (graph.canUndo()) {
            graph.undo();
        }
        return false;
    });
    graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
        if (graph.canRedo()) {
            graph.redo();
        }
        return false;
    });

    // select all
    graph.bindKey(['meta+a', 'ctrl+a'], () => {
        const nodes = graph.getNodes();
        if (nodes) {
            graph.select(nodes);
        }
    });

    // delete
    graph.bindKey('backspace', () => {
        const cells = graph.getSelectedCells();
        if (cells.length) {
            graph.removeCells(cells);
        }
    });

    // zoom
    graph.bindKey(['ctrl+1', 'meta+1'], () => {
        const zoom = graph.zoom();
        if (zoom < 1.5) {
            graph.zoom(0.1);
        }
    });
    graph.bindKey(['ctrl+2', 'meta+2'], () => {
        const zoom = graph.zoom();
        if (zoom > 0.5) {
            graph.zoom(-0.1);
        }
    });

    const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
        for (let i = 0, len = ports.length; i < len; i += 1) {
            ports[i].style.visibility = show ? 'visible' : 'hidden';
        }
    };
    graph.on('node:mouseenter', () => {
        const ports = container.querySelectorAll(
            '.x6-port-body',
        ) as NodeListOf<SVGElement>;
        showPorts(ports, true);
    });
    graph.on('node:mouseleave', () => {
        const ports = container.querySelectorAll(
            '.x6-port-body',
        ) as NodeListOf<SVGElement>;
        showPorts(ports, false);
    });
};
