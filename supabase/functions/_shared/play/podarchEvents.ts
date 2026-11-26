import { HELLSCAPE, HELLSCAPE_PEOPLE } from './hellscape.ts';
import { PODARCHS } from './podarchs.ts';

// Only cards featuring Special Victim meeples are removed. Setup people and
// events merely referring to a Victim remain part of their location.
const specialVictimEvents: Record<string, readonly string[]> = {
  [HELLSCAPE]: HELLSCAPE_PEOPLE.map(person => person.name),
  'Camp Happy Trails': ['Boyfriend','Girlfriend','Vengeance'],
  'Creech Manor': ['Ghost Hunters'],
  'Sacred Groves': ['The Tour Guide','The Uber Tourist','The Holy Man'],
  'Carnival of Blood': ['"Did you follow me here?"','"Run! I\'ll hold them off!"'],
  'Maple Lane': ['The Smalleys','Boyfriend'],
  'USS Konrad': ['The Captain','Jonas the Cat','Orphan Girl'],
  'Station 2891': ["What's Up Doc?",'Chow Time!','Comms Specialist'],
  'Wolfe Asylum': ['Hannibal the Cannibal','Dr. Death','Dr. Sunshine'],
  'Wingard Cottage': ['Marked for Death','Loser Boyfriend','Another Way Out'],
  'Storybook Woods': ['Hansel','The Woodsman','Pied Piper'],
  'Falconwood': ['Conspiracy Theorist','Head Researcher'],
  'Sunnydaze Mall': ['The Savior’s Girl','Bart the Mall Cop'],
  'Marrek Warehouse': ['Good Ole Zipp','Heroic Best Friend','The Supervisor'],
  'Shady Acres': ['Harvest Cultist','Sally McCoy','Ralph the Mechanic'],
  'MegaBGCon': ['Popular Game Designer','Media Starlet','Annoying Reporter','Industry Bad Boy'],
  'Buddyland': ['Birthday Girl','Nick the Janitor','Pizza Delivery'],
};
export function eligibleStartingEvent(killer: string | null | undefined, location: string | null, name: string | null) {
  if (killer !== PODARCHS || !location || !name) return true;
  const key = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');
  return !specialVictimEvents[location]?.some(event => key(event) === key(name));
}
