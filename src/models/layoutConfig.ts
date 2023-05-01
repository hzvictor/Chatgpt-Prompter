import { getTargetProjectDB,updateProjectDetail } from '@/database/prompter/project'

export default {
    state: {
        isDraggable: false,
        isResizable: false,
        showParameter: true,
        showTuning: true,
        showTest: true,
        showChat: true,
        layoutGrid: [],
        // showLogitBias:false,
    },

    effects: {
        *getlayoutConfig({ payload }: any, { call, put }: any) {
            const data = yield call(getTargetProjectDB, payload);
            yield put({
                type: 'newLayout', payload: data.layoutConfig
            });
        },
        *updateLayoutConfig({ payload }: any, { call, put }: any) {
            const data = yield call(updateProjectDetail, payload);

            yield put({
                type: 'newLayout', payload: payload.data.layoutConfig
            });
        },
    },

    reducers: {
        newLayout(state: any, { payload }: any) {
            return {
                ...state,
                ...payload
            };
        }
    },
};