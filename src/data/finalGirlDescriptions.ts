import { BUDDYLAND_VISUALS } from './buddyland';

/**
 * Visual descriptions for Final Girl characters
 * Used to augment AI image generation with accurate character appearances
 */

export const FINAL_GIRL_DESCRIPTIONS: Record<string, string> = {
  Adelaide: 'A young adult Black woman with deep brown skin, dark brown eyes, a softly oval face and tightly braided black hair pulled back from her face. She wears a plain white sleeveless tank top. Preserve the selected Adelaide portrait identity; its incidental bruises and cuts do not establish injuries in a new scene.',
  Barbara: 'A young adult woman with fair lightly freckled skin, pale green eyes, a rounded oval face and abundant copper-red tight curls falling around her shoulders. She wears a plain grey scoop-neck T-shirt. Preserve the selected Barbara portrait identity; its incidental bruises and cuts do not establish injuries in a new scene.',

  Rena: BUDDYLAND_VISUALS.rena,
  Gwynn: BUDDYLAND_VISUALS.gwynn,
  // Season 2 - Terror From the Grave (Vignette)
  'Patsy': `A woman in her early 20s with a slim, lithe build and a wary, observant presence. She has fair, pale skin densely dusted with natural freckles across her bridge of her nose and cheeks. Her face is delicate but sharp, featuring a narrow nose, high forehead, and a thin, set mouth. She has green eyes with a suspicious, sidelong glance, her gaze fixed on something just out of frame, conveying a mix of anxiety and quiet alertness.

Her hair is a vibrant, natural copper-red, cut into a short, textured pixie style with soft, messy bangs that look air-dried rather than styled. She wears no visible makeup, emphasizing a raw, naturalistic look. Her expression is guarded and unsmiling, reflecting a sense of mounting unease.

She appears caught in a tense, claustrophobic moment, appearing vulnerable yet vigilant. She is dressed in a classic, medium-wash denim jacket with a popped collar, buttoned high for utility. The overall aesthetic is cinematic and retro, reminiscent of a gritty late-70s or early-80s suspense film.`,

  // Season 3 - Don't Make a Sound
  'Meghan': `A young Black woman in her early 20s with a lean, resilient build and an uncompromising, fierce presence. Her skin is marked by the visceral aftermath of a struggle, featuring a heavy purple bruise swelling around her right eye, a trail of fresh blood from her nose, and fine crimson spatters across her neck and chest. Her face is heart-shaped with a defiant, set jaw and a straight nose. She has dark, piercing eyes that hold a direct, unwavering stare, conveying a mix of shock and cold, mounting resolve.

Her hair is jet-black and highly textured, styled into two large, rounded puffs on either side of her head. She wears no makeup, leaving her natural features raw and focused. Her expression is grim and unyielding, devoid of fear or vulnerability.

She appears battered but unbroken, a survivor caught in the immediate wake of a confrontation. She wears a simple, bright yellow v-neck t-shirt—now stained with blood—and a thin black ribbon choker.`,

  'Ronda': `A woman in her early 30s with a sharp, defiant presence and an edgy, underground energy. She has a pale complexion with a clear but textured skin quality, accentuated by harsh, high-contrast lighting. Her face is highly angular, featuring high cheekbones, a straight nose, and a firm, well-defined jawline. Her intense, light green eyes are wide and piercing, locked in a challenging, unyielding stare with neutral, slightly heavy brows.

Her hair is bleach-blonde and styled into a high, voluminous textured mohawk with closely shaved sides. She has multiple small silver stud and hoop piercings along the outer rim of her ears. Her expression is stone-faced and guarded, conveying a sense of hardened independence.

She wears a heavily distressed, mustard-yellow leather biker jacket with visible wear and tear over a faded, off-white graphic t-shirt.`,

  // Season 3 - The Marrek Murders
  'Mandy': `A woman in her late 20s to early 30s with a haunting and shell-shocked presence. She has medium-brown skin heavily marked with fresh, dark-red blood splatters and smears across her forehead, cheeks, and chin, suggesting a recent violent encounter. Her face has soft but defined features, a rounded jawline, and a prominent nose with a thin silver hoop in the nostril and a small septum ring. Her large, dark brown eyes are wide and glassy, gazing upward with a look of haunting realization and trauma.

Her hair is deep black, thick, and wavy, falling past her shoulders in a slightly disheveled manner. She wears no visible makeup; the focus is entirely on the raw, visceral bloodstains and her wide-eyed, hyper-vigilant expression. Her mouth is slightly agape, and her facial muscles are tense.

She embodies a gritty, cinematic survivor aesthetic—exhausted and bloodied but still standing. She wears a simple, functional purple hoodie that is also stained with blood.`,

  'Cassie': `A woman in her late 20s to early 30s with a lean, athletic build and a fierce, battle-hardened presence. She has pale skin heavily splattered with visceral, dark blood and smudges of grime that suggest an immediate and violent struggle. Her face is angular with a sharp jawline, high cheekbones, and a straight nose. She has intense, piercing blue eyes with a sharp, unwavering stare and slightly furrowed brows that convey lethal focus and a primal survival instinct.

Her hair is dark, chin-length, and messy, appearing slightly damp and unstyled. She wears chipped black nail polish on her fingertips. Her expression is cold, serious, and utterly defiant, showing no sign of fear.

She appears dangerous and capable, a combatant rather than a victim. She wears a practical black mesh athletic top and her hands are bound in thick, black athletic wraps, both of which are stained with blood.`,

  // Season 3 - Hell to Pay
  'Kenzie': `A woman in her late 20s with a shell-shocked yet resilient presence. Her pale skin is streaked with fresh, dark blood running from her hairline down her cheeks and mouth, suggesting a recent and violent struggle. Her face features wide, dark eyes that hold a haunted, fixed stare, framed by slightly furrowed brows that convey a mix of trauma and determination.

Her hair is dark, thick, and shaggy with voluminous 1980s-style layers and bangs, appearing disheveled and matted. She wears no visible makeup, with her features defined instead by the visceral staining of blood and the harsh shadows of the night. Her expression is emotionally raw—unsmiling, weary, and trapped in the immediate wake of survival.

She is dressed in a rugged, light-wash denim jacket over a torn, blood-stained grey t-shirt.`,
  
  'Julie': `A woman in her early-to-mid 20s with a lean, sturdy build and a weary, defiant presence. She has a medium complexion marked by fresh, shallow lacerations across her cheeks and chin that suggest a recent, violent struggle. Her face is heart-shaped with a soft jawline, a rounded nose, and deep, dark eyes that hold a heavy, thousand-yard stare. Her brow is slightly heavy, adding to a look of exhaustion mixed with grim resolve.

Her hair is jet black and long, styled with a striking undercut on the right side of her head, while the remaining hair falls loosely over her left shoulder in an unkempt fashion. She wears no visible makeup, with her skin appearing damp from sweat or humidity. Her expression is stoic and unsmiling, reflecting someone who has pushed past fear into a state of cold survival.

She is dressed in dark, utilitarian clothing, anchored by a thick black leather choker featuring a prominent silver O-ring.`,
  // Season 3 - The Falconwood Files
  'Octavia': 'A young woman in her early 20s with a sharp, defiant presence and a look of battle-hardened exhaustion. She has olive-toned skin marked by realistic trauma: a heavy purple-and-black bruise around her left eye, several small lacerations across her cheeks, and a fresh split in her lower lip. Her face is striking, characterized by heterochromia—one deep brown eye and one piercing ice-blue eye—locked in a steady, unflinching gaze that suggests she has just survived a violent encounter. Her hair is a brassy, bleached blonde, cut into a messy, textured shag that looks unwashed and wind-blown. She wears no makeup, her expression entirely serious and emotionally impenetrable. She is dressed in a heavily distressed light-wash denim jacket adorned with punk and metal influences, including a prominent "Slayer" patch and a skull graphic.',
  'Janelle': 'A young woman in her late teens to early 20s with a youthful, soft-featured face now defined by trauma. She has fair skin heavily splattered with fresh blood, a dark bruise blooming on her left cheek, and several small, raw cuts on her forehead and nose. Her face is oval with a delicate jaw and a straight nose. She has large, glassy hazel eyes that are rimmed with red and brimming with tears, capturing a moment of intense shock and lingering terror. Her light brown hair is voluminous and wavy, partially pulled back by an oversized, bright pink bow that is starkly contrasted by dark blood stains. She wears thick gold hoop earrings that catch the dim light. Her expression is haunted and breathless, with her lips slightly parted in a silent gasp. She is dressed in a vibrant denim jacket featuring a loud, 1980s geometric pattern in shades of yellow, blue, and red.',
  "Laurie": `A woman in her early-to-mid 30s with a lean, athletic build and a hardened, resilient presence. She has pale skin marked by dirt, faint bruising, and healed cuts that suggest recent hardship rather than stylized beauty. Her face is angular with high cheekbones, a narrow jaw, and a straight nose. She has intense, piercing light-blue eyes with a focused, defiant stare and slightly furrowed brows that convey determination and suppressed anger.

Her hair is dark blonde to light ash-blonde, straight, shoulder-length, worn loose and slightly messy, with a natural part and no visible styling. No makeup or only minimal, worn makeup. Her expression is serious, unsmiling, emotionally guarded.

She appears weathered but strong, like a survivor rather than a victim. Worn, practical clothing with muted colors. Fabric looks dirty, torn, or distressed rather than fashionable. Nothing ornamental or decorative. The overall aesthetic is gritty, grounded, and realistic.`,

  "Reiko": `A woman in her late 20s to early 30s with a compact, wiry build and a confrontational, unyielding presence. She has light-to-medium skin with visible bruising, swelling, and healed abrasions on her face and shoulders, suggesting recent physical conflict. Her face is rounder than angular, with strong cheekbones, a short nose, and a tense jaw. Her lips are slightly split and swollen. She wears a scowl or sneer, brows knitted tightly, projecting anger, defiance, and distrust rather than fear.

Her eyes are dark brown, intense, and narrowed, giving the impression that she's sizing up a threat rather than reacting to one.

She has straight black hair cut into a blunt chin-length bob with short, straight bangs that sit just above her eyebrows. Hair is neat but unstyled, practical rather than expressive.

She reads as tough, scrappy, and street-hardened—someone who doesn't back down and doesn't ask permission. She wears practical, worn clothing with visible damage—rips, tears, stretched fabric. Colors are muted but not dull, favoring everyday streetwear rather than survival gear. Nothing ornamental. Clothing looks lived-in, not styled.`,

  "Asami": `A woman in her mid-20s with a slender, resilient build and a calm, unflinching presence. She has warm olive-to-tan skin with visible dirt, small cuts, and dried blood across her face, neck, and collarbone, suggesting prolonged struggle rather than a single fight. Her face is softly angular with a narrow jaw, straight nose, and full but unsmiling lips. Her expression is steady, emotionally contained, and observant—less anger than endurance.

Her eyes are medium brown, large and alert, with a quiet intensity that suggests vigilance and inner resolve rather than confrontation.

She has dark brown hair, nearly black, worn loosely tied back in a messy, low arrangement, with thin strands falling around her face. Hair texture is natural and slightly unkempt, no styling or ornamentation.

She reads as a survivor shaped by sustained hardship—composed, inwardly strong, and quietly defiant. Simple, utilitarian clothing made of natural fabrics. Garments are torn, stained, and worn from use rather than fashion. Colors skew earthy or faded. Clothing feels practical, symbolic, or ritual-adjacent rather than modern streetwear.`,

  "Charlie": `A woman in her late 20s to early 30s with a lean, athletic build and a hardened, self-possessed presence. She has fair skin marked by fresh cuts, dried blood, and abrasions across her face and neck, suggesting recent violence rather than long-term wear. Her face is angular with a strong jawline, high cheekbones, and a straight nose. Her lips are set neutrally, neither defiant nor fearful—controlled, alert.

Her eyes are striking light blue, steady and assessing, giving the impression of someone constantly measuring risk.

Her hair is short, cropped, and blonde—cut close around the sides and back, slightly longer on top, tousled and practical rather than styled. The haircut reads as functional, almost military, not fashionable.

She gives off the energy of a capable fighter: alert, disciplined, and unwilling to be underestimated. She wears rugged, utilitarian clothing with protective elements—leather or heavy fabric outerwear, visible metal or reinforced shoulder pieces. Clothing is worn, scuffed, and practical. The look suggests readiness for conflict rather than survival-by-endurance.

Color palette: dark neutrals with a strong accent color (e.g., red undershirt).`,

  "Sheila": `A woman in her early-to-mid 20s with a slight, soft-built frame and a visibly shaken but determined presence. She has light-to-medium olive skin with freckles, dirt, and smeared dried blood across her face and clothing, suggesting sudden trauma rather than long-term hardening. Her face is round-to-oval with gentle features, a small straight nose, and slightly parted lips that convey shock, fear, and dawning resolve rather than anger.

Her eyes are dark brown, wide and reflective, with an anxious, searching expression—as if she's still processing what just happened while forcing herself to stay upright.

She has long, dark brown hair with a natural wave, worn loose and unstyled, falling past her shoulders. The hair frames her face unevenly, contributing to a disheveled, vulnerable look.

She wears large, round eyeglasses with thin metal frames—an essential identifying feature that immediately distinguishes her. The glasses slightly magnify her eyes, reinforcing her fragile, intellectual, and unprepared-for-violence appearance.

She reads as an ordinary person thrust into extraordinary danger: scared, overwhelmed, but not broken. Layered, everyday clothing rather than survival gear: a denim jacket with a shearling or fleece lining over a soft sweatshirt or sweater. Fabrics are visibly stained and rumpled. Colors are muted pastels and worn blues—casual, civilian, non-threatening.`,

  "Nancy": `A woman in her mid-to-late 20s with a compact, athletic build and a restrained, watchful presence. She has fair skin marked by light dirt, small cuts, and faint blood spatter, suggesting she's been close to violence but not overwhelmed by it. Her face is softly angular with a defined jaw, straight nose, and firm mouth set in a neutral, controlled expression.

Her eyes are a striking pale green, steady and unblinking, conveying alertness and internal calculation rather than fear or rage. She looks like someone who has already decided what she'll do if things go wrong.

She has short, naturally curly brown hair, cut to about chin length. The curls are loose and slightly uneven, framing her face without styling. The haircut reads as practical and unpretentious.

She appears grounded, composed, and quietly resilient—someone who doesn't posture, but doesn't hesitate either. Simple, close-fitting everyday clothing that allows movement. A plain short-sleeve shirt or top in muted or cool tones. Fabric shows signs of wear—stains, small tears—but nothing decorative. Clothing feels civilian and functional rather than tactical or fashionable.`,

  "Heather": `A woman in her early 20s with a lean, compact build and a gritty, battle-hardened presence. She has fair skin heavily layered with soot and grime, featuring fresh, shallow lacerations and abrasions across her forehead and cheeks. Her face is heart-shaped with a soft jawline but sharp, focused features. She has large, intense hazel eyes with a weary but piercingly direct gaze, framed by a slight, purposeful squint that suggests a high level of alertness.

Her hair is a shock of dyed yellow-blonde with prominent dark roots, cut into a messy, chin-length bob that appears unwashed and matted with dirt. She wears no makeup, her natural features obscured by the harshness of her environment. Her expression is stoic and unblinking, conveying a sense of hardened survival and quiet defiance. She wears a distressed, dark brown leather motorcycle jacket over a grime-stained black shirt. The overall aesthetic is raw, post-apocalyptic, and grounded in a harsh, realistic world.`,

  "Veronica": `A woman in her mid-20s with a lean, weary build and a haunted, survivalist presence. She has pale, textured skin marked by a trickle of fresh blood on her temple and a significant smear of dark, drying blood across her neck and collarbone. Her face is angular with high, prominent cheekbones and deep-set eyes framed by dark shadows of exhaustion. She has dark, intense eyes with a hollow, "thousand-yard" stare and a furrowed brow that conveys a mix of trauma and grim resolve.

Her hair is dark brown to black, long and unkempt, mostly concealed beneath a dark charcoal knit beanie. She wears no makeup, her appearance defined by the visceral reality of her environment. Her expression is stoic and emotionally drained, bordering on shock. She is dressed in practical, layered clothing: a dark maroon and grey zip-up jacket worn over a grey hoodie, both of which are stained with grime and blood. The overall aesthetic is cinematic, dark, and survival-horror, set within a dimly lit, dilapidated institutional corridor.`,

  "Kat": `A woman in her mid-20s with a cool, stoic presence. She has a fair complexion and a soft, oval face with a slightly rounded chin. Her most prominent feature is a pair of classic gold-rimmed aviator sunglasses that reflect a sunset, masking her eyes and adding an air of mystery. Her expression is neutral and calm, bordering on detached.

Her hair is a dirty blonde, wavy and voluminous, falling just past her shoulders with a natural, windswept look that suggests she's been outside for some time. She wears an oversized, olive-green military-style field jacket that looks sturdy and functional.`,

  "Tali": `A woman in her late 20s to early 30s with a lean, athletic build and a haunted, battle-hardened presence. Her skin is heavily smudged with grease, dirt, and dried blood, particularly trailing down her neck and collarbone, suggesting she has recently survived a violent encounter. Her face is sharp and expressive, featuring dark, intense eyes that convey a mixture of trauma and unwavering resolve.

Her dark hair is shoulder-length, matted with sweat and grime, peeking out from beneath a faded, camouflage-patterned patrol cap with a frayed brim. She wears a simple, ribbed white tank top that is stained and distressed, stripped of any ornamentation. Her expression is grim and unsmiling, with a "thousand-yard stare" that suggests deep emotional and physical fatigue.`,

  // Season 3 - Terror From Destiny (Vignette)
  'Gabrielle': `A young woman in her early 20s with a slender build and a calm, steadfast presence. She has a deep skin tone and a natural, unpolished appearance that suggests an authentic, urban life. Her face is soft but defined, with full lips, a rounded nose, and a steady, centered composure. She has dark, soulful eyes with a direct, level gaze that feels both observant and weary, framed by natural brows.

Her hair is a vibrant, saturated purple, styled in thick, tight coils that frame her face, partially tucked under a well-worn maroon knit beanie. She wears no visible makeup, emphasizing a grounded and realistic look. Her expression is neutral and stoic, carrying a quiet, unyielding intensity.

She wears a faded forest green v-neck t-shirt with minor distressing and small holes, layered under rugged, grey denim overalls with functional metal buckles. The clothing appears lived-in and practical, bearing the subtle dust of her environment. The overall aesthetic is gritty, urban, and atmospheric.`,

  "Joy": `A woman in her early 20s with a youthful but weathered and somber presence. She has fair skin heavily smudged with smears of blood and dirt, suggesting a recent violent struggle or a harsh environment. Her face is soft-featured but set in a grim, steady expression, with a straight nose and a neutral, weary mouth. She has piercing light-green eyes that hold a direct, unflinching gaze, conveying a sense of hollowed-out resilience.

Her blonde hair is parted down the middle and styled into two thick, functional braided pigtails. A single stalk of wheat is held between her lips, adding to the rustic, rural setting. She wears no makeup; her appearance is entirely unrefined and practical. Her expression is serious and emotionally exhausted, looking like someone who has seen too much.

She wears a worn, green and black plaid flannel shirt over faded blue denim overalls. The clothing is stained and utilitarian, suited for manual labor or survival in a rural landscape.`,

  "Vicky": `A woman in her late 20s with East Asian features and a vigilant, haunted presence. Her face is smudged with streaks of fresh blood and grime, suggesting she has just emerged from a violent encounter. Her expression is one of alert exhaustion, with dark, wide eyes and a neutral mouth that seems frozen in a moment of shock.

Her dark, wavy hair is long and unstyled, falling messy and voluminous around her shoulders. She wears no visible makeup, emphasizing the raw, unpolished nature of her situation. Around her neck is a thin, buckled leather strap, adding an element of grit or perhaps indicating a restrictive background.

She wears a heavily distressed denim jacket with frayed edges and small tears, layered over a simple charcoal t-shirt.`,

  "Ellen": `A woman in her mid-to-late 30s with a sturdy, capable build and a high-alert, survivalist presence. Her skin is fair but heavily weathered, coated in a layer of sweat, grease, and industrial grime that suggests she has been navigating a harsh environment for some time. Her face is striking and expressive, with a prominent nose, a sharp jawline, and a set mouth that conveys a mix of exhaustion and grim resolve.

She has large, dark, and soul-piercing eyes that are wide with a combination of fear and intense focus. Her dark brown hair is thick and shoulder-length, styled in a mass of wild, tangled curls that appear damp and matted. There is no visible makeup, and her expression is one of strained, defensive vigilance.

She wears a simple, practical white crew-neck t-shirt that is severely distressed and covered in dark, oily stains. The lighting is cinematic and high-contrast, featuring a sickly green rim light that highlights her silhouette against a dark, cramped industrial tunnel. The overall aesthetic is gritty, visceral, and reminiscent of a classic 1970s sci-fi horror protagonist.`,

  "Jenette": `A woman in her early-to-mid 30s with a lean, muscular, athletic build and a fierce, combat-ready presence. Her skin has a warm, deep tone but is heavily smeared with soot and grime, suggesting she is in the midst of a struggle. Her face is sharp and defined, with high cheekbones and a strong jawline. She has dark, piercing eyes fixed in a stern, unwavering glare, with deeply furrowed brows that signal intense concentration and defiance.

Her hair is jet black, styled in a bold, voluminous pompadour with closely cropped, faded sides. She wears no makeup, highlighting the raw, weathered texture of her skin. Her expression is hard and uncompromising, devoid of any softness.

She radiates the strength of a seasoned fighter rather than a victim. She wears a practical, ribbed olive-drab tank top that is stained with dirt and sweat. A striking red cloth is tied tightly around her left bicep, serving as a lone, utilitarian splash of color against the dark backdrop.`,

  "Kate": `A woman in her late 20s to early 30s with a lean, weary build and a haunted, survivalist presence. She has pale skin that appears damp and flushed from the cold, marked by faint grime and a look of physical exhaustion. Her face is heart-shaped with prominent cheekbones, a slightly pointed chin, and a soft nose. She has large, dark brown eyes with a wide, dazed, and vulnerable stare that suggests shock or hyper-vigilance.

Her hair is jet black, shoulder-length, and saturated with moisture, clinging to her forehead and neck in messy, tangled clumps. She wears no makeup, highlighting the raw intensity of her expression. Her mouth is slightly agape, conveying a sense of breathlessness or a silent plea for help.

She is wearing a heavy, olive-drab or brown canvas parka with a thick, fur-lined hood. The jacket is noticeably stained with dirt and dampness, emphasizing a desperate situation rather than casual wear.`,

  "Uki": `A woman in her late 30s to early 40s with a sturdy, resilient build and a weathered, grounded presence. She has medium-toned skin with subtle textures and wind-chilled coloring that suggest a life spent in harsh environments. Her face is full with soft features, a rounded jawline, and a broad nose. She has dark, deep-set eyes with an unwavering, direct gaze and a steady expression that conveys endurance and quiet strength.

Her hair is jet black, straight, and slightly windswept, framing her face with stray strands caught in the falling snow. She wears no makeup, emphasizing a raw and natural appearance. Her expression is solemn and guarded, yet deeply resolute, showing no signs of distress despite the freezing conditions.

She is dressed for extreme utility in a heavy, burnt-orange parka with a thick, frost-dusted faux-fur hood. The clothing is functional and high-quality, built for survival rather than style. She is often accompanied by her Alaskan Malamute, Gus.`,
  
  // Once Upon a Full Moon
  'Gretel': `A woman in her late 20s or early 30s with an olive complexion and a lean, hardened physicality. Her face is heavily weathered, smudged with dark earth and soot that highlights the sharp lines of her cheekbones and jaw. She possesses dark, piercing eyes with a steady, unblinking gaze that conveys a mixture of exhaustion and fierce, survivalist intent. Her expression is grim and guarded, suggesting a life defined by constant vigilance rather than comfort.

Her dark, wavy hair is long and disheveled, appearing matted with grime. The lower lengths feature distinctive streaks of deep red and navy blue—faded remnants of color that contrast with her otherwise primitive, unkempt appearance.

No makeup is visible; instead, her skin is textured with sweat and dirt. Her features are symmetrical but sharp, framed by a few loose, dark strands of hair falling across her forehead.

She wears rugged, utilitarian layers, including a frayed, ochre-colored sleeveless vest made of heavy, stained fabric. This is worn over a tattered, earth-toned undershirt with visible stitching and raw, distressed edges.`,

  'Red': `A woman in her mid-20s with a lithe, athletic build and a street-smart, resilient presence. Her skin is warm-toned and marked by fresh, shallow scratches across her cheeks and forehead, with traces of dried blood and dirt suggesting a recent struggle in the wild. Her face is heart-shaped with prominent cheekbones, a soft jawline, and a slender nose. She has deep brown, intelligent eyes that hold a sharp, calculating gaze and a hint of a defiant smirk.

Her hair is dark, styled in tight, thin braids that reach past her shoulders, looking practical and weathered with small bits of forest debris caught in the strands. She wears no visible makeup, letting her raw features and the signs of survival define her appearance. Her expression is calm and confident, bordering on mocking, as if she has the upper hand despite the surrounding danger.

She appears as a modern, gritty reimagining of a classic archetype—a seasoned traveler in a hostile wilderness. She wears a vibrant but heavily soiled red zip-up hoodie with white drawstrings, the fabric caked with mud and leaf litter. A simple dark cord necklace is visible at her throat. The overall aesthetic is grounded and cinematic, blending a striking pop of color with a harsh, survival-focused reality.`,

  // A Knock at the Door
  'Ginny': `A woman in her late 30s to early 40s with a rugged, battle-worn presence and a gaze of grim exhaustion. She has fair skin heavily marked by fresh abrasions, dried blood on the bridge of her nose and cheek, and layers of grime that suggest an active, desperate struggle for survival. Her face is heart-shaped with tired, hooded brown eyes that convey a mixture of trauma and hardened resolve.

Her hair is medium brown, shoulder-length, and highly disheveled, appearing greasy and matted with sweat and dirt. She wears no makeup, highlighting the raw textures of her weathered skin. Her expression is flat and somber, with a tightly set mouth that suggests she is emotionally spent but remains dangerous.

She is dressed in a worn, red and black buffalo-checkered flannel shirt over a stained, off-white thermal or t-shirt. The lighting is low and atmospheric, casting heavy shadows that emphasize the grit of her surroundings.`,

  'Ava': `A young Black woman in her late teens or early 20s with a defiant, battle-scarred appearance. She has deep brown skin marked by significant facial scarring, including a prominent jagged scar across her right cheek and a smaller cut on the bridge of her nose. Her face is oval-shaped with dark, soulful eyes that hold a gaze of quiet intensity and weary perseverance.

Her hair is a voluminous dark afro, styled with small gold beads or cuffs along braided sections on the side, adding a touch of personal identity amidst a harsh environment. She wears a single gold stud earring. Her expression is guarded and stoic, with a slight downturn to her lips that suggests she has seen too much for her age.

She is wearing a faded, light blue athletic-style shirt with white stripes on the shoulders, which is heavily stained with grease and dirt.`,

  // Terror From Above (Vignette)
  'Melanie': `A woman in her early-to-mid 30s with a lean, athletic build and a stoic, battle-hardened presence. She has pale skin marked by fresh scratches, dried blood, and smudges of dirt that suggest she has just emerged from a violent struggle. Her face is angular with high cheekbones and a sharp jawline. She has piercing light-blue eyes with a steady, unblinking gaze that conveys a mixture of cold calculation and resilient defiance.

Her hair is honey-blonde, styled in a short, textured crop that is swept back from her face, appearing slightly messy but intentional. She wears classic pearl stud earrings and a thick, polished gold choker, creating a stark contrast with her bloodied features. Her expression is grim and emotionally guarded, showing no signs of panic despite her injuries.

She wears a tattered olive-green field jacket over a simple white tank top. The jacket is visibly worn, with a large tear at the shoulder and layers of grime on the fabric.`,

  // Season 4 - Shriek
  'Adrianne': `A woman in her early-to-mid 20s with an average build and a calm, slightly detached presence. She has fair, smooth skin with natural, subtle texturing typical of vintage film photography rather than modern airbrushing. Her face is slightly angular with a strong jawline, full lips, and a straight nose. She has clear, light-blue eyes with a direct, steady stare and strong, neatly arched eyebrows that convey a quiet, observant seriousness.

Her hair is a striking, vibrant magenta-red, straight, shoulder-length, and styled in a sleek bob with blunt fringe bangs covering her forehead. She wears minimal, natural-looking makeup with a soft pinkish-nude lip and subtle shading. Her expression is serious, unsmiling, and emotionally composed.

She appears youthful but self-possessed, like a quiet rebel from a bygone era. She wears a practical, textured, dark-plum knit sweater with a simple crew neckline. The fabric looks warm and cozy rather than overtly fashionable. Nothing ornamental or decorative. The overall aesthetic is nostalgic, grounded, and realistic, resembling an authentic 1980s analog portrait set against a faded, patterned wallpaper.`,

  'Maureen': `A woman in her late 40s to early 50s with a commanding, authoritative presence. She has an olive complexion with smooth but mature skin, marked by a distinct mole on her left cheek. Her face features strong bone structure, a prominent, straight nose, and dark brown, piercing eyes. Her brows are dark, arched, and deeply furrowed, giving her a severe, critical, and unyielding stare.

Her hair is dark espresso brown, thick, and worn straight, falling past her shoulders with a soft, natural volume and a subtle side part. She wears classic, professional makeup featuring matte brick-red lipstick and lightly defined eyes, complemented by elegant pearl stud earrings. Her expression is stern, unsmiling, and highly guarded, projecting a sense of intense scrutiny and no-nonsense professionalism.

She is dressed in a bold, structured crimson red blazer characteristic of 1980s power dressing, layered over a simple, casual heather-grey crewneck top. The overall aesthetic is grounded, corporate, and sharply realistic, evoking the atmosphere of a tense, late-20th-century office environment.`,

};

/**
 * Get the visual description for a Final Girl by name
 * Returns undefined if no description exists
 */
export function getFinalGirlDescription(name: string): string | undefined {
  return FINAL_GIRL_DESCRIPTIONS[name];
}
