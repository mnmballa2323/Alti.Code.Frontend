import { directorAgent } from './director.agent.js';

const startMission = async (goal, context) => {
    return await directorAgent.startMission(goal, context);
};

const getMissionStatus = async (missionId) => {
    return directorAgent.getMissionStatus(missionId);
};

export const DirectorService = {
    startMission,
    getMissionStatus
};
