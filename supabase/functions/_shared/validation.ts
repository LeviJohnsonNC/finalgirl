import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { corsHeaders } from './auth.ts';

const MissionSchema = z.object({ name: z.string().min(1).max(100), description: z.string().max(1500) });

// Schema for generate-story endpoint
export const StoryRequestSchema = z.object({
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
});

// Schema for generate-scene-image endpoint (opening still + closing poster)
export const SceneImageRequestSchema = z.object({
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
  finalGirlHealth: z.number().int().min(0).max(10).optional(),
  killerHealth: z.number().int().min(0).max(20).optional(),
  mission: MissionSchema.optional(),
  scenarioRules: z.string().max(6000).optional(),
  // Used to name the stored file, and to clean up the image being replaced.
  gameId: z.string().uuid().optional(),
  referenceImageUrl: z.string().url().max(2000).optional(),
  previousImageUrl: z.string().url().max(2000).optional()
});

// Schema for generate-visual-bible endpoint
export const VisualBibleRequestSchema = z.object({
  killerDescription: z.string().max(3000).optional(),
  finalGirlDescription: z.string().max(3000).optional(),
  moduleVisualGuidance: z.string().max(3000).optional(),
  killer: z.string().min(1).max(100),
  finalGirl: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  locationDescription: z.string().max(3000).optional()
});

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
  finalGirlHealth: z.number().int().min(0).max(10).optional(),  // Photographed cards span 4–7; buffer for explicit observations
  killerHealth: z.number().int().min(0).max(20).optional(),
  finalGirlMaxHealth: z.number().int().min(1).max(10).optional(),  // Session-specific; photographed cards span 4–7
  victimsSaved: z.number().int().min(0).max(999).optional(),
  victimsKilled: z.number().int().min(0).max(999).optional(),
  endingSubLocation: z.string().max(200).optional(),
  gameHighlights: z.string().max(2000).optional(),
  roundsPlayed:z.number().int().min(1).max(999).optional(),
  playSummary:z.string().max(1800).optional()
});

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
