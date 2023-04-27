import { proxyWithPersistEasy, newProxyWithPersist } from '@/utils/persistence';
import { makeNodeId } from '@/utils/withNodeId';
import { subscribe,snapshot } from 'valtio';
import { updateTablist } from '@/database/tablist'
import { activeProject } from './project';
const initTabId = makeNodeId();
export  const tabData = newProxyWithPersist(
    {
        activeTabListId: {
            slideListId: initTabId,
            logitBiasId: initTabId,
            testId: initTabId,
            systemId: initTabId,
            conversationId: initTabId,
        },
        slideListTabList: {
            slideListId: [
                {
                    label: 'Parameter',
                    key: initTabId,
                    isEdite: false,
                    closable: false,
                },
            ],
            logitBiasId: [
                {
                    label: 'Logit Bias',
                    key: initTabId,
                    isEdite: false,
                    closable: false,
                },
            ],
            testId: [
                {
                    label: 'Test',
                    key: initTabId,
                    isEdite: false,
                    closable: false,
                },
            ],
            systemId: [
                {
                    label: 'System',
                    key: initTabId,
                    isEdite: false,
                    closable: false,
                },
            ],
            conversationId: [
                {
                    label: 'Conversation',
                    key: initTabId,
                    isEdite: false,
                    closable: false,
                },
            ],
        },
    },
    {
        dbName: 'tabData',
    },
);


subscribe(tabData.activeTabListId, () => {
    // console.log(tabData,"activeTabListId")
    localStorage.setItem('tabData', JSON.stringify(snapshot(tabData)));
    updateTablist(activeProject.activeProjectID,snapshot(tabData))
})

subscribe(tabData.slideListTabList, () => {
    // console.log(tabData,"slideListTabList")
    localStorage.setItem('tabData', JSON.stringify(snapshot(tabData)));
    updateTablist(activeProject.activeProjectID,snapshot(tabData))
})

// export const slideListTabList = proxyWithPersistEasy(
//     {
//         slideListId: [
//             {
//                 label: 'Parameter',
//                 key: initTabId,
//                 isEdite: false,
//                 closable: false,
//             },
//         ],
//         logitBiasId: [
//             {
//                 label: 'Logit Bias',
//                 key: initTabId,
//                 isEdite: false,
//                 closable: false,
//             },
//         ],
//         testId: [
//             {
//                 label: 'Test',
//                 key: initTabId,
//                 isEdite: false,
//                 closable: false,
//             },
//         ],
//     },
//     {
//         key: 'slideListTabList',
//     },
// );

// proxyWithPersistEasy(
//     {
//         slideListId: initTabId,
//         logitBiasId: initTabId,
//         testId: initTabId,
//     },
//     {
//         key: 'activeListIds',
//     },
// );
