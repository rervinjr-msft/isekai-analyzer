---
date: 2026-04-12
topic: ux-refinements
---

# UX Refinements and Arrival Taxonomy Restructure

## Problem Frame

After initial implementation and testing, several UX gaps and data model issues surfaced. Users cannot search for anime already in the database, the side panel does not show full analysis details, the category filter lists unused categories, duplicate anime can be re-analyzed unnecessarily, titles are saved with user input rather than their canonical AniList name, and the arrival stage taxonomy collapses distinct dimensions (form, age, location) into flat categories that lose information and create combinatorial explosion.

## Requirements

**Search and Browse**

- R1. A search box near the graph filters allows users to search anime already in the database by title. Results appear in a dropdown or list. Selecting a result opens the side panel with that anime's full analysis.

**Side Panel Detail View**

- R2. Selecting an anime in the side panel replaces the anime list with a full analysis view for that anime: title, confidence score, explanation, and all story beats with their stage/category labels and raw text. A back button returns to the anime list.

**Duplicate Prevention**

- R3. When a user submits a title that already exists in the database (matched by AniList ID, not user-typed title), the system skips re-analysis entirely and opens the existing entry's detail view. To correct a bad analysis, the user deletes the entry and re-submits. This simplifies the flow and avoids storing multiple analysis versions for the same anime.

**Canonical Title**

- R4. When saving an anime, use the full English title from AniList (falling back to romaji if English is null or empty string) instead of the user's typed input.

**Category Filter Cleanup**

- R5. The category filter dropdown only lists categories that have at least one anime associated with them. Empty/unused taxonomy categories are hidden from the filter.

**Arrival Beat Constraints**

- R6. The arrival stage produces exactly one beat per anime (not multiple). The prompt instructs the LLM to produce a single arrival beat. If the LLM returns multiple arrival beats, the system takes the first and discards the rest.

**Arrival Taxonomy Restructure**

- R7. The arrival beat is structured as three sub-fields rather than a single flat category:
  - **form**: what the protagonist becomes (e.g., human, slime, spider, skeleton)
  - **age**: life stage if the protagonist has a humanoid form (e.g., baby, child, adult), null for non-humanoid forms (e.g., slime, spider) where life stage is not meaningful
  - **location**: where they first appear (e.g., city, wilderness, dungeon, forest, cave)
- R8. The arrival node in the graph displays the composite label (e.g., "human baby in city", "slime in wilderness"). For graph aggregation, arrivals with identical form + age + location share a node.
- R9. The current flat arrival seed categories (`reborn as child`, `reborn as monster/non-human`, etc.) are replaced by the sub-field model. Existing seed data and any user-analyzed data with old-format arrival beats need migration. The simplest approach is to re-run the seed script and accept that manually-added anime with old arrival formats will need to be deleted and re-analyzed.

## Success Criteria

- Searching for "Slime" in the search box finds "That Time I Got Reincarnated as a Slime" and opens its full analysis
- Submitting an anime already in the database shows the existing entry without calling the LLM
- Saved anime titles match AniList's English title, not the user's typo or abbreviation
- The category filter shows only categories that appear in at least one analyzed anime
- Each anime has exactly one arrival beat with form, age, and location sub-fields
- The graph correctly aggregates arrival nodes by their composite identity

## Scope Boundaries

- No free-text search across beat descriptions or explanations — title search only
- No fuzzy/autocomplete search — substring match is sufficient
- No restructuring of departure, transition, or powers stages — only arrival changes
- No migration CLI tool — seed data can be manually re-generated

## Key Decisions

- **Three sub-fields over composite string**: Structured sub-fields (form, age, location) enable filtering by each dimension independently in future iterations, whereas a composite string would require parsing
- **Detail view in side panel**: Reuses the existing panel rather than adding a new page or modal. Keeps the graph visible for context.
- **Match by AniList ID for duplicates**: Matching on AniList ID rather than title string avoids false negatives from abbreviations, alternate spellings, or language differences
- **English title with romaji fallback**: Most users interact in English. Romaji fallback covers anime without official English titles.

## Outstanding Questions

### Deferred to Planning

- [Affects R7][Technical] How should the arrival sub-fields be represented in the `Beat` type — embedded object on the beat, or a separate `ArrivalDetail` type referenced by ID?
- [Affects R8][Technical] How should arrival beats relate to the `BeatCategory` taxonomy post-restructure — removed from taxonomy entirely with dynamic composite nodes, or each unique form+age+location combination registered as a category?
- [Affects R9][Needs research] What is the simplest approach to migrate existing seed data to the new arrival format — re-run seed script, or write a one-time transform?
- [Affects R8][Technical] How should the graph node ID be constructed for composite arrival beats — concatenation of sub-fields, or a hash?
- [Affects R1][Technical] Should selecting a search result also highlight the anime's path on the graph, or just open the detail view independently?

## Next Steps

→ `/ce-plan` for structured implementation planning
