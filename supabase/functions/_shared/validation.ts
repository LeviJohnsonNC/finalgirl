import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { corsHeaders } from './auth.ts';

const TormentorReviewSchema=z.object({loss:z.enum(['unknown','none','trap-terminal','no-escape','endless-traps'])}).strict();
const TormentorOpeningSchema=z.enum(['fresh-v1','legacy-unknown']);
const GrimlashReviewSchema=z.object({loss:z.enum(['none','unknown','skull','telluric'])}).strict();
const MissionSchema = z.object({ name: z.string().min(1).max(100), description: z.string().max(1500) });
const KonradReviewSchema = z.object({fate:z.enum(['unknown','survived','airlock-loss','explosion-loss'])}).strict();

// Schema for generate-story endpoint
export const StoryRequestSchema = z.object({
  tormentorOpening:TormentorOpeningSchema.optional(),
  mission: MissionSchema.optional(),
  killer: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(5000).optional(),
    specialRules: z.string().max(3000).optional()
  }),
  location: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(5000).optional(),
    specialRules: z.string().max(3000).optional()
  }),
  finalGirl: z.object({
    name: z.string().min(1).max(100),
    backstory: z.string().max(5000).optional()
  }),
  startingEvent: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(5000).optional()
  }).optional().nullable(),
  startingSetup: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(5000).optional()
  }).optional().nullable()
}).refine(v=>!v.tormentorOpening||v.killer.name==='The Tormentor',{message:'Tormentor opening provenance belongs to The Tormentor'});

// Schema for generate-scene-image endpoint (opening still + closing poster)
export const SceneImageRequestSchema = z.object({
  tormentorOpening:TormentorOpeningSchema.optional(),
  tormentorReview:TormentorReviewSchema.optional(),
  grimlashReview:GrimlashReviewSchema.optional(),
  konradReview: KonradReviewSchema.optional(),
  sceneType: z.enum(['beginning', 'ending']),
  story: z.string().min(50).max(10000),
  killer: z.string().min(1).max(100),
  killerDescription: z.string().max(3000).optional(),
  finalGirl: z.string().min(1).max(100),
  finalGirlDescription: z.string().max(3000).optional(),
  location: z.string().min(1).max(100),
  locationDescription: z.string().max(3000).optional(),
  moduleVisualGuidance: z.string().max(3000).optional(),
  visualBible: z.string().max(1000).optional(),
  outcome: z.enum(['won', 'lost']).optional(),
  introStory: z.string().max(10000).optional(),
  finalGirlHealth: z.number().int().min(0).max(14).optional(),
  killerHealth: z.number().int().min(0).max(20).optional(),
  mission: MissionSchema.optional(),
  scenarioRules: z.string().max(6000).optional(),
  // Used to name the stored file, and to clean up the image being replaced.
  gameId: z.string().uuid().optional(),
  referenceImageUrl: z.string().url().max(2000).optional(),
  previousImageUrl: z.string().url().max(2000).optional()
}).refine(v=>!v.grimlashReview||v.killer==='Grimlash'&&v.sceneType==='ending',{message:'Madness review belongs to Grimlash ending'}).refine(v=>!v.grimlashReview||!['skull','telluric'].includes(v.grimlashReview.loss)||v.outcome==='lost',{message:'Madness loss requires lost outcome'}).refine(v=>v.killer==='Grimlash'||(v.finalGirlHealth??0)<=10,{message:'Raised Health requires Grimlash'}).refine(value=>!value.konradReview||value.location==='USS Konrad'&&value.sceneType==='ending',{message:'Ship review belongs to USS Konrad ending',path:['konradReview']}).refine(value=>!value.konradReview||!['airlock-loss','explosion-loss'].includes(value.konradReview.fate)||value.outcome==='lost',{message:'Fatal ship ending requires a loss',path:['outcome']}).refine(v=>!v.tormentorOpening||v.killer==='The Tormentor'&&v.sceneType==='beginning',{message:'Tormentor opening provenance belongs to an opening'}).refine(v=>!v.tormentorReview||v.killer==='The Tormentor'&&v.sceneType==='ending',{message:'Tormentor review belongs to its ending'}).refine(v=>!v.tormentorReview||['none','unknown'].includes(v.tormentorReview.loss)||v.outcome==='lost',{message:'Tormentor loss requires a lost result'});

// Schema for generate-visual-bible endpoint
export const VisualBibleRequestSchema = z.object({
  tormentorOpening:TormentorOpeningSchema.optional(),
  killerDescription: z.string().max(3000).optional(),
  finalGirlDescription: z.string().max(3000).optional(),
  moduleVisualGuidance: z.string().max(3000).optional(),
  killer: z.string().min(1).max(100),
  finalGirl: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  locationDescription: z.string().max(3000).optional()
}).refine(v=>!v.tormentorOpening||v.killer==='The Tormentor',{message:'Tormentor opening provenance belongs to The Tormentor'});

// Schema for narrate-story endpoint
export const NarrationRequestSchema = z.object({
  text: z.string().min(10).max(10000),
  // Which moment is being read, so the narrator can be cast to match it.
  // Optional: an omitted kind reads as the opening, which is the old behaviour.
  kind: z.enum(['intro', 'ending', 'death']).optional(),
  outcome: z.enum(['won', 'lost']).optional(),
  filmId: z.string().max(100).optional(),
  deathSceneId:z.string().uuid().optional()
}).refine(value=>value.kind!=='death'||Boolean(value.deathSceneId),{message:'Death narration requires a saved scene',path:['deathSceneId']});

// Schema for generate-ending endpoint
export const EndingRequestSchema = z.object({
  tormentorReview:TormentorReviewSchema.optional(),
  grimlashReview:GrimlashReviewSchema.optional(),
  mission: MissionSchema.optional(),
  // Required fields
  introStory: z.string().min(50).max(10000),
  outcome: z.enum(['won', 'lost']),
  killer: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(3000).optional(),
    specialRules: z.string().max(3000).optional()
  }),
  location: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(3000).optional(),
    specialRules: z.string().max(3000).optional()
  }),
  finalGirl: z.object({
    name: z.string().min(1).max(100),
    backstory: z.string().max(3000).optional()
  }),
  // Optional game stats
  finalHorrorLevel: z.number().int().min(0).max(7).optional(),
  weaponUsed: z.string().max(100).optional(),
  finalGirlHealth: z.number().int().min(0).max(14).optional(),  // Photographed cards span 4–7; buffer for explicit observations
  killerHealth: z.number().int().min(0).max(20).optional(),
  finalGirlMaxHealth: z.number().int().min(1).max(14).optional(),  // Session-specific; photographed cards span 4–7
  victimsSaved: z.number().int().min(0).max(999).optional(),
  victimsKilled: z.number().int().min(0).max(999).optional(),
  endingSubLocation: z.string().max(200).optional(),
  gameHighlights: z.string().max(2000).optional(),
  roundsPlayed:z.number().int().min(1).max(999).optional(),
  playSummary:z.string().max(1800).optional(),
  konradReview:KonradReviewSchema.optional(),
  poltergeistReview:z.object({carolynRescued:z.literal(true).nullable(),floppyAtEscape:z.literal(true).nullable(),epicRequired:z.boolean().nullable(),escapeRoute:z.enum(['exit','helicopter']).nullable().optional()}).strict().optional()
}).refine(v=>!v.grimlashReview||v.killer.name==='Grimlash',{message:'Madness review belongs to Grimlash'}).refine(v=>!v.grimlashReview||!['skull','telluric'].includes(v.grimlashReview.loss)||v.outcome==='lost',{message:'Madness loss requires lost outcome'}).refine(v=>v.killer.name==='Grimlash'||(v.finalGirlHealth??0)<=10&&(v.finalGirlMaxHealth??0)<=10,{message:'Raised Health requires Grimlash'}).refine(value=>!value.konradReview||value.location.name==='USS Konrad',{message:'Ship review belongs to USS Konrad',path:['konradReview']}).refine(value=>!value.konradReview||!['airlock-loss','explosion-loss'].includes(value.konradReview.fate)||value.outcome==='lost',{message:'Fatal ship ending requires a loss',path:['outcome']}).refine(value=>value.poltergeistReview?.escapeRoute!=='helicopter'||value.location.name==='Creech Manor',{message:'Helicopter rescue route belongs to Creech Manor',path:['poltergeistReview','escapeRoute']}).refine(value=>!value.poltergeistReview||value.killer.name==='Poltergeist',{message:'Rescue review belongs to Poltergeist',path:['poltergeistReview']}).refine(v=>!v.tormentorReview||v.killer.name==='The Tormentor',{message:'Tormentor review belongs to The Tormentor'}).refine(v=>!v.tormentorReview||['none','unknown'].includes(v.tormentorReview.loss)||v.outcome==='lost',{message:'Tormentor loss requires a lost result'});

export type StoryRequest = z.infer<typeof StoryRequestSchema>;
export type SceneImageRequest = z.infer<typeof SceneImageRequestSchema>;
export type VisualBibleRequest = z.infer<typeof VisualBibleRequestSchema>;
export type NarrationRequest = z.infer<typeof NarrationRequestSchema>;
export type EndingRequest = z.infer<typeof EndingRequestSchema>;

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  responseCors: HeadersInit = corsHeaders
): { success: true; data: T } | { success: false; error: Response } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Validation error:', err.errors);
      return {
        success: false,
        error: new Response(
          JSON.stringify({ error: 'Invalid request format' }),
          { status: 400, headers: { ...responseCors, 'Content-Type': 'application/json' } }
        )
      };
    }
    return {
      success: false,
      error: new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...responseCors, 'Content-Type': 'application/json' } }
      )
    };
  }
}


export const DeathRequestSchema=z.object({sessionId:z.string().uuid(),eventId:z.string().uuid(),take:z.number().int().min(0).max(2).default(0),narrativeProfile:z.literal("fright-private-nightmares-v1").optional()}).strict();
