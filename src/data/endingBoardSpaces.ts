import { CON_SPACES } from "../../supabase/functions/_shared/play/megabgconCatalog";
import { WOLFE_SPACES } from '../../supabase/functions/_shared/play/wolfeCatalog';
// Supplemental suggestions for boards without shared Play room catalogs.
// Names come from Van Ryder Games' Series 2 and 3 Feature Film Rules
// the Wolfe Asylum death book, and the MegaBGCon location sheet. Unnamed spaces can be entered as text.
export const ENDING_BOARD_SPACES: Record<string, readonly string[]> = {
  'Wolfe Asylum': [...WOLFE_SPACES,'Laundry Room'],
  'Sunnydaze Mall': [
    'Atrium', 'Boards ‘N Bones', 'Food Court', 'Joystick Heroes', 'Military Surplus ‘R Us',
    'Railing', 'Security', 'Smokin’ Subject', 'Stan’s Sporting Goods', 'Zap Shack',
  ],
  Falconwood: [
    'Best Friend’s House', 'Community Pool', 'Fanghorn Forest', 'Library', 'School', 'Town Fair',
  ],
  Hellscape: ['The Nexus'],
  Utopia: ['Bunker', 'Crossroads', 'General Store', 'Water Tower'],
  MegaBGCon: CON_SPACES,
};
