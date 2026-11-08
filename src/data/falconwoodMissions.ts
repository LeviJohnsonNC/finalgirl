import { FALCONWOOD, FALCONWOOD_MISSIONS, missionByName } from '../../supabase/functions/_shared/play/falconwood';

export { FALCONWOOD_MISSIONS };
export type { FalconwoodMission } from '../../supabase/functions/_shared/play/falconwood';
export const FALCONWOOD_LOCATION_NAME = FALCONWOOD;
export const locationHasMissions = (location?: string | null) => location?.toLowerCase() === FALCONWOOD.toLowerCase();
export const getMissionByName = missionByName;
export const getRandomMission = () => FALCONWOOD_MISSIONS[Math.floor(Math.random() * FALCONWOOD_MISSIONS.length)];
