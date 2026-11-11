import { SLAYER_VISUAL } from "@/lib/play/slayer";
import { INTRUDER_VISUAL } from "@/lib/play/intruders";
import { WOLF_VISUAL } from "@/lib/play/bigBadWolf";
import {TORMENTOR_VISUAL} from '../../supabase/functions/_shared/play/tormentor';
import {GRIMLASH_VISUAL} from '../../supabase/functions/_shared/play/grimlash';
import { INKANYAMBA_VISUAL } from "../../supabase/functions/_shared/play/inkanyamba";
import { FRIGHT_VISUAL } from '../../supabase/functions/_shared/play/fright';
import { GEPPETTO_VISUAL } from '../../supabase/functions/_shared/play/geppetto';
import { HANS_VISUAL } from './rules/campRules';
import { BUDDYLAND_VISUALS } from './buddyland';

/**
 * Visual descriptions for Killer characters
 * Used to augment AI image generation with accurate character appearances
 */

export const KILLER_DESCRIPTIONS: Record<string, string> = {
  Inkanyamba: INKANYAMBA_VISUAL,
  'Billy the Bear': BUDDYLAND_VISUALS.billy,
  // Season 3 - Don't Make a Sound
  'The Eyeless': `A humanoid creature with a pale, greyish-beige complexion and a powerful, lean muscularity. The skin is highly textured with visible veins, mottled discoloration, and a matte, leathery quality that suggests practical prosthetic makeup rather than digital effects. The most striking feature is a large, fan-like crest extending from the forehead and temples, ribbed with bony ridges and parchment-like membranes that appear both ancient and organic.

The face is gaunt and monstrous, with deeply sunken, dark eyes and a wide-open, snarling mouth that reveals rows of long, needle-sharp fangs. Viscous saliva drips from the lower jaw, emphasizing a primal, predatory state. The creature's expression is one of pure, mindless aggression. Its location, pose and lighting are determined by the selected scene; it is blind and hunts by sound.`,

  // Season 3 - The Marrek Murders
  'The Tormentor': TORMENTOR_VISUAL,

  // Season 3 - Hell to Pay
  'Razorface': `A man in his late 20s to mid-30s with a lean, muscular, and athletic build. He has a chilling, authoritative presence that feels ritualistic and intensely focused. His skin is a stark, sickly pale white, providing a high-contrast canvas for the metalwork. His head and face are meticulously pierced with long metal pins arranged in a precise, geometric grid pattern. He has dark, hollowed eyes with an unblinking, cold stare and sharp, angular facial features, including a defined jawline and a thin, expressionless mouth.

He is shirtless, wearing an intricate black leather harness with various straps, buckles, and metal O-rings across his chest. Heavy metal chains are draped around his neck and wrapped around his waist. His forearms are tightly bound in dark, weathered fabric wraps. In his hands, he delicately holds a realistic human heart that has also been pierced by several long pins.`,
  "Hans": HANS_VISUAL,

  "Geppetto": GEPPETTO_VISUAL,

  "Dr. Fright": FRIGHT_VISUAL,

  "Ratchet Lady": `A woman in her early 30s with a lean, frantic build and a terrifying, visceral presence. Her skin is pale and sallow, heavily smudged with soot and grime. Her face is almost entirely encased in thick, dingy medical bandages that wrap tightly around her head and eyes, leaving only her mouth exposed. Her expression is one of primal, unhinged ferocity, with her jaw dropped in a wide, silent scream.

She has no visible hair or features beyond the bandages, creating a sense of total anonymity and psychological distress. She wears a tattered, sleeveless dress made of frayed, off-white fabric that resembles aged bandages or coarse linen, featuring a jagged, uneven hemline and multiple stains. Around her right forearm is a heavy, rusted metal cuff, while her left hand grips a small, dark-bladed knife. The overall aesthetic is high-intensity psychological horror, grounded in a decaying, claustrophobic environment with harsh, abrasive lighting.`,

  "The Hunter": `A tall, imposing figure with a broad, powerful build and a silent, predatory presence. Their identity is entirely hidden behind a sleek, featureless dark-blue metallic visor that glows with a faint internal light, stripping away any human emotion. They stand with a rigid, ready posture that projects a sense of calculated, cold-blooded intent.

The clothing is a gritty "urban warrior" ensemble: a deep-red hoodie worn under a heavily weathered, blue leather motorcycle jacket. The jacket is noticeably battle-scarred, featuring several circular bullet holes and scuffed edges that suggest survival through extreme violence. They wear dark, practical denim jeans and grip a heavy, chrome long-barrel revolver in their right hand, held firmly at their side.

The overall aesthetic is "synthwave noir"—a gritty, neon-soaked homage to 80s action thrillers and retro-futuristic vigilantes.`,

  "Grimlash": GRIMLASH_VISUAL,

  "Evomorph": `A monstrous, biomechanical apex predator with a powerful, sinewy build and a terrifying, lethal presence. Its anatomy is a grotesque blend of glistening, deep-red muscular tissue and pale, exposed skeletal structures that look both organic and engineered. It occupies a low, aggressive crouch, conveying a sense of coiled tension and imminent violence.

The creature's head is elongated and faceless, featuring a prominent, jagged jaw filled with needle-like teeth and no visible eyes, which enhances its uncanny and relentless appearance. A massive, segmented tail—thick with armored plates and sinew—curls menacingly over its torso, terminating in a sharp, scythe-like stinger. Its limbs are long and corded with visible muscle, terminating in sharp, predatory claws.

The surface of its body appears wet and visceral, as if it has recently emerged from a cocoon or a bloody encounter. It is positioned in a dark, claustrophobic industrial tunnel with circular concrete walls and wet, reflective floors.`,

  "The Organism": `A concealed mimic that passes for an ordinary person until a physical reveal. Revealed forms differ: a tall asymmetric torso maw with tendrils, a stocky hooked-armed form, and a low splayed form with stacked eyes. Use tangible practical creature effects and depict only the forms supported by the scene’s facts.`,

  // Once Upon a Full Moon
  'Big Bad Wolf': WOLF_VISUAL,

  // A Knock at the Door
  'The Intruders': INTRUDER_VISUAL,

  // The Falconwood Files
  Slayer: SLAYER_VISUAL,

  // Terror From Above (Vignette)
  'Birds': `A dense, chaotic swarm of dozens of black birds, primarily crows or ravens, caught in mid-flight against a turbulent, oppressive sky. The birds are scattered across the frame in a frantic, non-linear pattern, their silhouettes sharp and jagged against the clouds. Some are captured with wings fully arched in a power stroke, while others appear to be diving or banking sharply, creating a visceral sense of frantic motion and avian panic.

The backdrop is a heavy, low-hanging sky dominated by thick, roiling storm clouds in shades of charcoal, deep slate, and bruised grey. A diffused, cold light source struggles to break through the center of the cloud cover, casting a pale, high-contrast glow that rim-lights the birds and adds layers of depth to the atmosphere. The overall aesthetic is gritty, ominous, and gothic—evoking the feeling of a brewing tempest or a dark, cinematic supernatural thriller.`,

  // Season 2 - Terror From the Grave (Vignette)
  'Zombies': `A dense collective of shambling undead, featuring a variety of ages and builds, moving with a heavy, rhythmic, and relentless presence. Their skin is a pallid, necrotic grey, marked by dirt, bruising, and the visible hollows of decomposition rather than stylized gore. Faces are gaunt with sunken cheekbones and slack jaws; their eyes are clouded and vacant, staring ahead with a mindless, predatory focus that suggests a total loss of individual identity.

Their hair is matted, stringy, and disheveled, caked with grime and the remnants of their former lives. There is no makeup or sense of grooming, only the raw, weathered look of the elements and decay. Their expressions are vacant and unsmiling, fixed in a state of permanent, guttural hunger that is emotionally hollow and deeply unsettling.

They appear as a weathered, decaying tide of humanity, functioning as a singular, overwhelming force rather than individuals. They wear soiled, tattered, and distressed clothing—ranging from business suits to casual denim—that looks genuinely worn and abandoned. The overall aesthetic is gritty, grounded, and cinematic, reminiscent of mid-century creature horror.`,

  // Season 3 - Terror From Destiny (Vignette)
  'Destiny': `Ultra-realistic 1980s film photograph, shot on 35mm with natural grain and slight color fade. Nighttime or late dusk. Practical lighting only (streetlights, lamps, headlights), creating deep shadows and warm highlights. Scene suggests a strange accident or near-miss, but the cause is unclear. Everyday objects slightly out of place—a fallen ladder, spilled groceries, a swinging door, a flickering light, a stopped clock, rain on pavement reflecting light. No visible attacker. No supernatural glow. Just eerie coincidence.

Composition feels candid, like a photojournalist arrived moments after something went wrong. Shallow depth of field, imperfect focus, mild motion blur, and natural lens falloff. Muted, realistic color palette. Subtle tension rather than spectacle. The mood should imply fate, bad luck, or a chain reaction about to happen. Nothing stylized, nothing digital-looking—it should feel like a real photograph from the 1980s found in a shoebox.

Emotional tone: quiet dread, inevitability, "this could happen to anyone."`,

  'Mort the Teenage Dirtbag': `A masked teen-slasher figure wearing a charcoal gray hoodie with the hood up, red-and-black pants, and a white ghost mask with one oversized black eye and a smaller dark eye socket. The silhouette is casual and convention-ready rather than gothic: hoodie, sneakers, loose posture, and a knife implied or held low. Mort's threat is disguise and misdirection — the same figure may seem to be Hans, Geppetto, Dr. Fright, the Big Bad Wolf, or another familiar horror persona moments before the mask comes off.

Composition: candid convention-floor slasher imagery, with crowded boardgame aisles, cosplay suspects, demo tables, banners, and confused attendees in the background. Grainy, oversaturated VHS quality with tracking lines and color bleed. The vibe is slasher-meets-teen-comedy—absurd and menacing at the same time.

Emotional tone: paranoid fun, "who's behind the mask?", teen horror energy.`
};

/**
 * Get the visual description for a killer by name
 * Returns undefined if no description exists
 */
export function getKillerDescription(name: string): string | undefined {
  return KILLER_DESCRIPTIONS[name];
}
