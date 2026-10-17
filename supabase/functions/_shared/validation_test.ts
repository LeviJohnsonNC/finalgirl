import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { StoryRequestSchema, SceneImageRequestSchema, EndingRequestSchema, NarrationRequestSchema, DeathRequestSchema, validateRequest } from "./validation.ts";

// ============== StoryRequestSchema Tests ==============

Deno.test("StoryRequestSchema - valid request with all fields", () => {
  const validRequest = {
    killer: { name: "Dr. Fright", description: "A deranged scientist" },
    location: { name: "Creech Manor", description: "An abandoned mansion" },
    finalGirl: { name: "Nancy", backstory: "A resourceful babysitter" },
    startingEvent: { name: "Power Outage", description: "The lights go out" },
    startingSetup: { name: "Scattered Victims", description: "Victims are spread across the map" },
  };

  const result = validateRequest(StoryRequestSchema, validRequest);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data.killer.name, "Dr. Fright");
    assertEquals(result.data.finalGirl.name, "Nancy");
  }
});

Deno.test("StoryRequestSchema - valid request with minimal fields", () => {
  const minimalRequest = {
    killer: { name: "Poltergeist" },
    location: { name: "Camp Happy Trails" },
    finalGirl: { name: "Laurie" },
  };

  const result = validateRequest(StoryRequestSchema, minimalRequest);
  assertEquals(result.success, true);
});

Deno.test("StoryRequestSchema - valid request with null optional fields", () => {
  const requestWithNulls = {
    killer: { name: "The Hunter" },
    location: { name: "Sacred Groves" },
    finalGirl: { name: "Alice" },
    startingEvent: null,
    startingSetup: null,
  };

  const result = validateRequest(StoryRequestSchema, requestWithNulls);
  assertEquals(result.success, true);
});

Deno.test("StoryRequestSchema - invalid request missing killer name", () => {
  const invalidRequest = {
    killer: { description: "A mysterious figure" },
    location: { name: "Creech Manor" },
    finalGirl: { name: "Nancy" },
  };

  const result = validateRequest(StoryRequestSchema, invalidRequest);
  assertEquals(result.success, false);
  if (!result.success) {
    assertExists(result.error);
  }
});

Deno.test("StoryRequestSchema - invalid request with empty killer name", () => {
  const invalidRequest = {
    killer: { name: "" },
    location: { name: "Creech Manor" },
    finalGirl: { name: "Nancy" },
  };

  const result = validateRequest(StoryRequestSchema, invalidRequest);
  assertEquals(result.success, false);
});

Deno.test("StoryRequestSchema - rejects overly long description", () => {
  const longDescription = "x".repeat(6000); // Exceeds 5000 char limit
  const invalidRequest = {
    killer: { name: "Test", description: longDescription },
    location: { name: "Test" },
    finalGirl: { name: "Test" },
  };

  const result = validateRequest(StoryRequestSchema, invalidRequest);
  assertEquals(result.success, false);
});

// ============== SceneImageRequestSchema Tests ==============
const scene = {
  sceneType: 'beginning', story: 'A dark story that is long enough to pass the minimum character requirement.',
  killer: 'Hans', finalGirl: 'Laurie', location: 'Camp Happy Trails',
};
Deno.test('SceneImageRequestSchema - accepts scene and poster requests', () => {
  assertEquals(validateRequest(SceneImageRequestSchema, scene).success, true);
  assertEquals(validateRequest(SceneImageRequestSchema, { ...scene, sceneType: 'ending', outcome: 'won', gameId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }).success, true);
});
Deno.test('SceneImageRequestSchema - rejects invalid kinds and short stories', () => {
  assertEquals(validateRequest(SceneImageRequestSchema, { ...scene, sceneType: 'middle' }).success, false);
  assertEquals(validateRequest(SceneImageRequestSchema, { ...scene, story: 'Too short' }).success, false);
});
Deno.test('SceneImageRequestSchema - rejects arbitrary storage path identifiers', () => {
  assertEquals(validateRequest(SceneImageRequestSchema, { ...scene, gameId: '../someone-else' }).success, false);
});
Deno.test('validateRequest - preserves caller CORS on errors', () => {
  const result = validateRequest(SceneImageRequestSchema, {}, { 'Access-Control-Allow-Origin': 'https://preview.lovable.app' });
  assertEquals(result.success, false);
  if (!result.success) assertEquals(result.error.headers.get('Access-Control-Allow-Origin'), 'https://preview.lovable.app');
});

// ============== EndingRequestSchema Tests ==============

Deno.test("EndingRequestSchema - valid won outcome request", () => {
  const validRequest = {
    introStory: "A story that needs to be at least 50 characters long to pass validation requirements for the ending generator.",
    outcome: "won",
    killer: { name: "Dr. Fright" },
    location: { name: "Creech Manor" },
    finalGirl: { name: "Nancy" },
  };

  const result = validateRequest(EndingRequestSchema, validRequest);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data.outcome, "won");
  }
});

Deno.test("EndingRequestSchema - valid lost outcome request with stats", () => {
  const validRequest = {
    introStory: "A story that needs to be at least 50 characters long to pass validation requirements for the ending generator.",
    outcome: "lost",
    killer: { name: "Poltergeist", description: "A vengeful spirit" },
    location: { name: "Camp Happy Trails", description: "An abandoned summer camp" },
    finalGirl: { name: "Laurie", backstory: "A camp counselor" },
    finalHorrorLevel: 7,
    weaponUsed: "Fire axe",
    finalGirlHealth: 0,
    killerHealth: 15,
    victimsSaved: 2,
    victimsKilled: 5,
    endingSubLocation: "The boathouse",
    gameHighlights: "Epic final confrontation at the dock",
  };

  const result = validateRequest(EndingRequestSchema, validRequest);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data.finalHorrorLevel, 7);
    assertEquals(result.data.victimsSaved, 2);
  }
});

Deno.test("EndingRequestSchema - invalid outcome value", () => {
  const invalidRequest = {
    introStory: "A story that needs to be at least 50 characters long to pass validation requirements for the ending generator.",
    outcome: "draw", // Invalid - must be 'won' or 'lost'
    killer: { name: "Test" },
    location: { name: "Test" },
    finalGirl: { name: "Test" },
  };

  const result = validateRequest(EndingRequestSchema, invalidRequest);
  assertEquals(result.success, false);
});

Deno.test("EndingRequestSchema - invalid horror level out of range", () => {
  const invalidRequest = {
    introStory: "A story that needs to be at least 50 characters long to pass validation requirements for the ending generator.",
    outcome: "won",
    killer: { name: "Test" },
    location: { name: "Test" },
    finalGirl: { name: "Test" },
    finalHorrorLevel: 10, // Max is 7
  };

  const result = validateRequest(EndingRequestSchema, invalidRequest);
  assertEquals(result.success, false);
});

// ============== NarrationRequestSchema Tests ==============

Deno.test("NarrationRequestSchema - valid request", () => {
  const validRequest = {
    text: "This is a valid narration text that is at least 10 characters.",
  };

  const result = validateRequest(NarrationRequestSchema, validRequest);
  assertEquals(result.success, true);
});

Deno.test("NarrationRequestSchema - rejects text under 10 characters", () => {
  const invalidRequest = {
    text: "Too short",
  };

  const result = validateRequest(NarrationRequestSchema, invalidRequest);
  assertEquals(result.success, false);
});

Deno.test("NarrationRequestSchema - rejects text over 10000 characters", () => {
  const invalidRequest = {
    text: "x".repeat(10001),
  };

  const result = validateRequest(NarrationRequestSchema, invalidRequest);
  assertEquals(result.success, false);
});

// ============== General Validation Tests ==============

Deno.test("validateRequest - returns error response for invalid JSON structure", () => {
  const invalidData = "not an object";
  const result = validateRequest(StoryRequestSchema, invalidData);
  assertEquals(result.success, false);
  if (!result.success) {
    assertExists(result.error);
  }
});

Deno.test("validateRequest - returns error response for null input", () => {
  const result = validateRequest(StoryRequestSchema, null);
  assertEquals(result.success, false);
  if (!result.success) {
    assertExists(result.error);
  }
});


Deno.test('EndingRequestSchema - rejects fractional health and victim counts', () => {
  const request = { introStory: 'A long enough opening story for the ending generator to maintain continuity.', outcome: 'won', killer: { name: 'Hans' }, location: { name: 'Camp Happy Trails' }, finalGirl: { name: 'Laurie' }, victimsSaved: 1.5 };
  assertEquals(validateRequest(EndingRequestSchema, request).success, false);
});

Deno.test('EndingRequestSchema - bounds recorded rounds and timeline context',()=>{
 const base={introStory:'A long enough opening story for the ending generator to maintain continuity.',outcome:'won',killer:{name:'Hans'},location:{name:'Camp Happy Trails'},finalGirl:{name:'Laurie'}};
 assertEquals(validateRequest(EndingRequestSchema,{...base,roundsPlayed:5,playSummary:'Round 2: Saved 1 victim',victimsSaved:0}).success,true);
 for(const roundsPlayed of [0,1.5,1000])assertEquals(validateRequest(EndingRequestSchema,{...base,roundsPlayed}).success,false);
 assertEquals(validateRequest(EndingRequestSchema,{...base,playSummary:'x'.repeat(1801)}).success,false);
});

Deno.test('DeathRequestSchema - allows only stable IDs and three explicit takes',()=>{
 const request={sessionId:'11111111-1111-4111-8111-111111111111',eventId:'22222222-2222-4222-8222-222222222222'};
 assertEquals(validateRequest(DeathRequestSchema,request).success,true);
 for(const bad of [{...request,take:3},{...request,take:1.5},{...request,eventId:'bad'},{...request,killer:'someone else'}])assertEquals(validateRequest(DeathRequestSchema,bad).success,false);
});

Deno.test('NarrationRequestSchema - death narration requires a saved scene UUID',()=>{
 const base={text:'An original saved death scene.',kind:'death'};
 assertEquals(validateRequest(NarrationRequestSchema,base).success,false);
 assertEquals(validateRequest(NarrationRequestSchema,{...base,deathSceneId:'not-an-id'}).success,false);
 assertEquals(validateRequest(NarrationRequestSchema,{...base,deathSceneId:'11111111-1111-4111-8111-111111111111'}).success,true);
});
