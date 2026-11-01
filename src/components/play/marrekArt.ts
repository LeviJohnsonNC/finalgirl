import type {ModuleArt} from './ModuleArtwork';
import aliases from '@/assets/play/photos/marrek/aliases.json';
import p0 from '@/assets/play/banners/marrek.webp';
import t0 from '@/assets/play/photos/marrek/header-thumb.webp';
import p1 from '@/assets/play/photos/marrek/main-locked.webp';
import t1 from '@/assets/play/photos/marrek/main-locked-thumb.webp';
import p2 from '@/assets/play/photos/marrek/main-unlocked.webp';
import t2 from '@/assets/play/photos/marrek/main-unlocked-thumb.webp';
import p3 from '@/assets/play/photos/marrek/dock-a-locked.webp';
import t3 from '@/assets/play/photos/marrek/dock-a-locked-thumb.webp';
import p4 from '@/assets/play/photos/marrek/dock-a-unlocked.webp';
import t4 from '@/assets/play/photos/marrek/dock-a-unlocked-thumb.webp';
import p5 from '@/assets/play/photos/marrek/dock-b-locked.webp';
import t5 from '@/assets/play/photos/marrek/dock-b-locked-thumb.webp';
import p6 from '@/assets/play/photos/marrek/zipp.webp';
import t6 from '@/assets/play/photos/marrek/zipp-thumb.webp';
import p7 from '@/assets/play/photos/marrek/friend.webp';
import t7 from '@/assets/play/photos/marrek/friend-thumb.webp';
import p8 from '@/assets/play/photos/marrek/supervisor.webp';
import t8 from '@/assets/play/photos/marrek/supervisor-thumb.webp';
import p9 from '@/assets/play/photos/marrek/forklift-off.webp';
import t9 from '@/assets/play/photos/marrek/forklift-off-thumb.webp';
import p10 from '@/assets/play/photos/marrek/plank-off.webp';
import t10 from '@/assets/play/photos/marrek/plank-off-thumb.webp';
import p11 from '@/assets/play/photos/marrek/trucks.webp';
import t11 from '@/assets/play/photos/marrek/trucks-thumb.webp';
import p12 from '@/assets/play/photos/marrek/racks.webp';
import t12 from '@/assets/play/photos/marrek/racks-thumb.webp';
import p13 from '@/assets/play/photos/marrek/scatter.webp';
import t13 from '@/assets/play/photos/marrek/scatter-thumb.webp';
import p14 from '@/assets/play/photos/marrek/days.webp';
import t14 from '@/assets/play/photos/marrek/days-thumb.webp';
import p15 from '@/assets/play/photos/marrek/relock.webp';
import t15 from '@/assets/play/photos/marrek/relock-thumb.webp';
import p16 from '@/assets/play/photos/marrek/heads.webp';
import t16 from '@/assets/play/photos/marrek/heads-thumb.webp';
import p17 from '@/assets/play/photos/marrek/smarter.webp';
import t17 from '@/assets/play/photos/marrek/smarter-thumb.webp';
import p18 from '@/assets/play/photos/marrek/trap.webp';
import t18 from '@/assets/play/photos/marrek/trap-thumb.webp';
import p19 from '@/assets/play/photos/marrek/zipp-saved.webp';
import t19 from '@/assets/play/photos/marrek/zipp-saved-thumb.webp';
import p20 from '@/assets/play/photos/marrek/zipp-killed.webp';
import t20 from '@/assets/play/photos/marrek/zipp-killed-thumb.webp';
import p21 from '@/assets/play/photos/marrek/friend-saved.webp';
import t21 from '@/assets/play/photos/marrek/friend-saved-thumb.webp';
import p22 from '@/assets/play/photos/marrek/friend-killed.webp';
import t22 from '@/assets/play/photos/marrek/friend-killed-thumb.webp';
import p23 from '@/assets/play/photos/marrek/supervisor-saved.webp';
import t23 from '@/assets/play/photos/marrek/supervisor-saved-thumb.webp';
import p24 from '@/assets/play/photos/marrek/supervisor-killed.webp';
import t24 from '@/assets/play/photos/marrek/supervisor-killed-thumb.webp';
import p25 from '@/assets/play/photos/marrek/forklift-on.webp';
import t25 from '@/assets/play/photos/marrek/forklift-on-thumb.webp';
import p26 from '@/assets/play/photos/marrek/plank-on.webp';
import t26 from '@/assets/play/photos/marrek/plank-on-thumb.webp';
import p27 from '@/assets/play/photos/marrek/terror-could-be-anywhere.webp';
import t27 from '@/assets/play/photos/marrek/terror-could-be-anywhere-thumb.webp';
import p28 from '@/assets/play/photos/marrek/terror-safer-up-there.webp';
import t28 from '@/assets/play/photos/marrek/terror-safer-up-there-thumb.webp';
import p29 from '@/assets/play/photos/marrek/terror-saw-the-killer.webp';
import t29 from '@/assets/play/photos/marrek/terror-saw-the-killer-thumb.webp';
import p30 from '@/assets/play/photos/marrek/terror-open-boxes.webp';
import t30 from '@/assets/play/photos/marrek/terror-open-boxes-thumb.webp';
import p31 from '@/assets/play/photos/marrek/terror-pushed.webp';
import t31 from '@/assets/play/photos/marrek/terror-pushed-thumb.webp';
import p32 from '@/assets/play/photos/marrek/dock-b-unlocked.webp';
import t32 from '@/assets/play/photos/marrek/dock-b-unlocked-thumb.webp';
const photos:Record<string,[string,string]>={
 'header':[p0,t0],
 'main-locked':[p1,t1],
 'main-unlocked':[p2,t2],
 'dock-a-locked':[p3,t3],
 'dock-a-unlocked':[p4,t4],
 'dock-b-locked':[p5,t5],
 'zipp':[p6,t6],
 'friend':[p7,t7],
 'supervisor':[p8,t8],
 'forklift-off':[p9,t9],
 'plank-off':[p10,t10],
 'trucks':[p11,t11],
 'racks':[p12,t12],
 'scatter':[p13,t13],
 'days':[p14,t14],
 'relock':[p15,t15],
 'heads':[p16,t16],
 'smarter':[p17,t17],
 'trap':[p18,t18],
 'zipp-saved':[p19,t19],
 'zipp-killed':[p20,t20],
 'friend-saved':[p21,t21],
 'friend-killed':[p22,t22],
 'supervisor-saved':[p23,t23],
 'supervisor-killed':[p24,t24],
 'forklift-on':[p25,t25],
 'plank-on':[p26,t26],
 'terror-could-be-anywhere':[p27,t27],
 'terror-safer-up-there':[p28,t28],
 'terror-saw-the-killer':[p29,t29],
 'terror-open-boxes':[p30,t30],
 'terror-pushed':[p31,t31],
 'dock-b-unlocked':[p32,t32],
};
export function marrekArt(id:string,thumb=false):ModuleArt {const key=(aliases as Record<string,string>)[id]??id,p=photos[key];if(!p)throw new Error('Missing Warehouse photograph: '+id);return {src:p[thumb?1:0],fit:'slice',position:'50% 42%'};}
