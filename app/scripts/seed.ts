/** Pre-analyzed seed dataset for the Isekai Story Beat Analyzer.
 * These are manually verified beats for well-known isekai titles. */

import fs from "fs";
import path from "path";
import { AppData, AnalyzedAnime, Beat, BeatCategory } from "../src/types";
import { SEED_TAXONOMY } from "../src/lib/taxonomy";

function cat(stage: string, name: string): string {
  return `${stage}-${name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
}

function beat(
  stage: "departure" | "transition" | "arrival" | "powers",
  categoryName: string,
  rawText: string,
  arrivalDetail?: { form: string; age: string | null; location: string }
): Beat {
  return {
    id: `beat-seed-${Math.random().toString(36).slice(2, 8)}`,
    stage,
    categoryId: arrivalDetail
      ? cat("arrival", arrivalDetail.age
          ? `${arrivalDetail.form} ${arrivalDetail.age} in ${arrivalDetail.location}`
          : `${arrivalDetail.form} in ${arrivalDetail.location}`)
      : cat(stage, categoryName),
    rawText,
    ...(arrivalDetail ? { arrivalDetail } : {}),
  };
}

const SEED_ANIME: AnalyzedAnime[] = [
  {
    id: "seed-sword-art-online",
    anilistId: 11757,
    title: "Sword Art Online",
    isIsekai: true,
    confidence: 0.85,
    explanation: "Players are trapped inside a virtual reality MMORPG, unable to log out. While debated as isekai, the protagonist is fully immersed in an alternate world.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "logged into game", "Kirito logs into the new VRMMORPG Sword Art Online using the NerveGear"),
      beat("transition", "gradual realization", "Players discover the logout button is missing and the game master announces death in-game means death in real life"),
      beat("arrival", "human adult in city", "Kirito starts in the Town of Beginnings on Floor 1", { form: "human", age: "adult", location: "city" }),
      beat("powers", "retains past-life knowledge", "Kirito leverages his beta tester experience to gain an early advantage"),
    ],
  },
  {
    id: "seed-rezero",
    anilistId: 21355,
    title: "Re:ZERO -Starting Life in Another World-",
    isIsekai: true,
    confidence: 0.98,
    explanation: "Subaru is transported to a fantasy world after leaving a convenience store, a classic isekai setup.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "fell into portal", "Subaru is mysteriously transported to another world after leaving a convenience store"),
      beat("transition", "transported instantly", "The transition is instantaneous with no intermediary encounter"),
      beat("arrival", "human adult in city", "Subaru appears in a medieval fantasy city", { form: "human", age: "adult", location: "city" }),
      beat("powers", "granted unique skill", "Subaru discovers he has Return by Death, the ability to rewind time upon dying"),
    ],
  },
  {
    id: "seed-konosuba",
    anilistId: 21202,
    title: "KONOSUBA -God's blessing on this wonderful world!",
    isIsekai: true,
    confidence: 0.99,
    explanation: "Kazuma dies and is reincarnated into a fantasy world by a goddess, the quintessential isekai premise.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "death by vehicle", "Kazuma dies from shock after pushing a girl out of the path of what he thought was a truck (actually a slow tractor)"),
      beat("transition", "meets deity/god", "Kazuma meets the goddess Aqua who offers him reincarnation in a fantasy world with one item or ability of his choice"),
      beat("arrival", "human adult in city", "Kazuma arrives in the city of Axel with Aqua", { form: "human", age: "adult", location: "city" }),
      beat("powers", "no special ability", "Kazuma has average stats; his 'cheat item' was Aqua herself, who turns out to be useless"),
    ],
  },
  {
    id: "seed-slime",
    anilistId: 101280,
    title: "That Time I Got Reincarnated as a Slime",
    isIsekai: true,
    confidence: 0.99,
    explanation: "A man is killed and reincarnated as a slime in a fantasy world, a textbook isekai premise.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "murdered", "Satoru Mikami is stabbed by a random assailant on the street"),
      beat("transition", "reincarnation process", "As he dies, a mysterious voice grants him abilities based on his dying thoughts"),
      beat("arrival", "non-human in cave", "Rimuru awakens as a slime in a dark cave", { form: "slime", age: null, location: "cave" }),
      beat("powers", "given cheat-level power", "Rimuru possesses the unique skills Predator and Great Sage, making him extremely powerful"),
    ],
  },
  {
    id: "seed-overlord",
    anilistId: 20832,
    title: "Overlord",
    isIsekai: true,
    confidence: 0.95,
    explanation: "The protagonist is trapped in a game world when the servers shut down, transported to a new reality as his game character.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "logged into game", "Momonga stays logged into YGGDRASIL as the servers are about to shut down"),
      beat("transition", "gradual realization", "Instead of being logged out, Momonga realizes the NPCs are alive and the game world has become real"),
      beat("arrival", "non-human in dungeon", "Momonga remains in the Great Tomb of Nazarick as the skeletal overlord Ainz Ooal Gown", { form: "skeleton", age: null, location: "dungeon" }),
      beat("powers", "given cheat-level power", "Ainz retains all his max-level abilities and powerful items from the game"),
    ],
  },
  {
    id: "seed-shield-hero",
    anilistId: 99263,
    title: "The Rising of the Shield Hero",
    isIsekai: true,
    confidence: 0.99,
    explanation: "Naofumi is summoned to another world as one of four legendary heroes.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "summoned by ritual", "Naofumi is summoned to Melromarc as the Shield Hero through a magical ritual"),
      beat("transition", "transported instantly", "The summoning transports him instantaneously to the throne room"),
      beat("arrival", "human adult in city", "Naofumi appears in the castle of the kingdom of Melromarc", { form: "human", age: "adult", location: "city" }),
      beat("powers", "granted mundane/weak power", "The Legendary Shield is considered the weakest of the four holy weapons, with no offensive capability"),
    ],
  },
  {
    id: "seed-mushoku-tensei",
    anilistId: 108465,
    title: "Mushoku Tensei: Jobless Reincarnation",
    isIsekai: true,
    confidence: 0.99,
    explanation: "A NEET is killed and reborn as a baby in a fantasy world, one of the genre-defining isekai.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "death by vehicle", "A 34-year-old NEET is hit by a truck while saving high school students"),
      beat("transition", "reincarnation process", "He is reborn as a baby named Rudeus Greyrat in a medieval fantasy world"),
      beat("arrival", "human baby in city", "Rudeus is born as an infant in the Greyrat household in Buena Village", { form: "human", age: "baby", location: "city" }),
      beat("powers", "retains past-life knowledge", "Rudeus retains his adult memories and begins training magic from infancy, showing prodigious talent"),
    ],
  },
  {
    id: "seed-no-game-no-life",
    anilistId: 19815,
    title: "No Game No Life",
    isIsekai: true,
    confidence: 0.98,
    explanation: "Sibling gamers are transported to a world where everything is decided by games.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "summoned by ritual", "Sora and Shiro accept a chess challenge from the god Tet and are summoned to Disboard"),
      beat("transition", "meets deity/god", "They meet and defeat Tet, the One True God, in a game of chess"),
      beat("arrival", "human adult in city", "They arrive in the kingdom of Elkia, the last human territory", { form: "human", age: "adult", location: "city" }),
      beat("powers", "retains past-life knowledge", "Sora and Shiro are unbeatable gamers who use their strategic genius from their original world"),
    ],
  },
  {
    id: "seed-log-horizon",
    anilistId: 17265,
    title: "Log Horizon",
    isIsekai: true,
    confidence: 0.90,
    explanation: "Players of an MMORPG find themselves trapped inside the game world after an expansion update.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "logged into game", "30,000 Japanese players are trapped inside Elder Tale after the Homesteading the Noosphere expansion"),
      beat("transition", "gradual realization", "Shiroe gradually realizes he is fully inside the game world with real sensations and consequences"),
      beat("arrival", "human adult in city", "Shiroe finds himself in the game city of Akiba", { form: "human", age: "adult", location: "city" }),
      beat("powers", "gains class/job system", "Shiroe retains his Enchanter class with full access to the game's magic and skill system"),
    ],
  },
  {
    id: "seed-spider",
    anilistId: 103632,
    title: "So I'm a Spider, So What?",
    isIsekai: true,
    confidence: 0.99,
    explanation: "A high school girl is reincarnated as a spider monster in a fantasy world dungeon.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "murdered", "An entire high school class is killed when a mysterious explosion destroys the classroom"),
      beat("transition", "reincarnation process", "The students are reincarnated into various forms in a fantasy world"),
      beat("arrival", "non-human in dungeon", "Kumoko is reborn as a small spider in the Great Elroe Labyrinth", { form: "spider", age: null, location: "dungeon" }),
      beat("powers", "gains class/job system", "Kumoko has access to a skill and level-up system, starting with basic spider abilities like thread and poison"),
    ],
  },
  {
    id: "seed-cautious-hero",
    anilistId: 105156,
    title: "Cautious Hero: The Hero Is Overpowered but Overly Cautious",
    isIsekai: true,
    confidence: 0.98,
    explanation: "A Japanese man is summoned by a goddess to save a fantasy world, a classic isekai summoning plot.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "summoned by ritual", "Seiya Ryuuguuin is summoned by the goddess Ristarte to save the world of Gaeabrande"),
      beat("transition", "meets deity/god", "Seiya meets Ristarte in the Divine Realm and begins over-preparing before going to the other world"),
      beat("arrival", "human adult in wilderness", "Seiya arrives in Gaeabrande fully prepared after extensive training in the Divine Realm", { form: "human", age: "adult", location: "wilderness" }),
      beat("powers", "given cheat-level power", "Seiya has maxed-out stats and refuses to engage any enemy without being extremely overprepared"),
    ],
  },
  {
    id: "seed-how-not-to-summon",
    anilistId: 101004,
    title: "How Not to Summon a Demon Lord",
    isIsekai: true,
    confidence: 0.98,
    explanation: "A gamer is summoned into his game world as his max-level demon lord character.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "summoned by ritual", "Takuma Sakamoto is summoned to another world by two girls performing a slave-binding ritual"),
      beat("transition", "transported instantly", "The summoning spell pulls him directly into the game world as his character Diablo"),
      beat("arrival", "human adult in wilderness", "Diablo appears in a field near the city of Faltra", { form: "human", age: "adult", location: "wilderness" }),
      beat("powers", "given cheat-level power", "Diablo retains all his max-level equipment and abilities, plus a ring that reflects enslavement magic"),
    ],
  },
  {
    id: "seed-wise-mans-grandchild",
    anilistId: 100112,
    title: "Wise Man's Grandchild",
    isIsekai: true,
    confidence: 0.97,
    explanation: "A man dies in a traffic accident and is reincarnated as a baby in a fantasy world, raised by a legendary sage.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "death by vehicle", "A young salaryman is killed in a traffic accident"),
      beat("transition", "reincarnation process", "He is reborn as a baby in a medieval fantasy world"),
      beat("arrival", "human baby in city", "Shin Wolford is found as an infant and raised by the legendary sage Merlin Wolford in a forest home near the capital", { form: "human", age: "baby", location: "city" }),
      beat("powers", "given cheat-level power", "Shin develops extraordinary magic abilities far beyond normal humans due to Merlin's unconventional training"),
    ],
  },
  {
    id: "seed-grimgar",
    anilistId: 21428,
    title: "Grimgar of Fantasy and Ash",
    isIsekai: true,
    confidence: 0.92,
    explanation: "Characters awaken in a fantasy world with no memories of their previous lives, a more grounded take on isekai.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "fell into portal", "A group of people find themselves in darkness with no memories of how they got there"),
      beat("transition", "gradual realization", "They gradually realize they are in a fantasy world and have no way back"),
      beat("arrival", "human adult in city", "Haruhiro and others emerge in the frontier town of Ortana", { form: "human", age: "adult", location: "city" }),
      beat("powers", "granted mundane/weak power", "Each person chooses a class (thief, warrior, mage, etc.) but starts at the weakest level with minimal skills"),
    ],
  },
  {
    id: "seed-bookworm",
    anilistId: 108268,
    title: "Ascendance of a Bookworm",
    isIsekai: true,
    confidence: 0.98,
    explanation: "A librarian dies and is reincarnated as a sickly child in a medieval world without books.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "natural death", "Motosu Urano, a book-obsessed college graduate, is crushed to death by falling books during an earthquake"),
      beat("transition", "reincarnation process", "She is reincarnated into the body of a sickly five-year-old girl named Myne"),
      beat("arrival", "human child in city", "Myne lives in a poor family in a medieval European-style city", { form: "human", age: "child", location: "city" }),
      beat("powers", "retains past-life knowledge", "Myne retains her extensive knowledge of books, papermaking, and modern manufacturing techniques"),
    ],
  },
  {
    id: "seed-arifureta",
    anilistId: 100668,
    title: "Arifureta: From Commonplace to World's Strongest",
    isIsekai: true,
    confidence: 0.99,
    explanation: "An entire class is summoned to a fantasy world to fight as heroes.",
    analyzedAt: "2026-01-01T00:00:00Z",
    beats: [
      beat("departure", "summoned as part of a group", "Hajime Nagumo and his entire class are summoned to the world of Tortus by the god Ehit"),
      beat("transition", "meets deity/god", "The class is summoned by the Holy Church on behalf of the god Ehit to be heroes"),
      beat("arrival", "human adult in city", "The class arrives in the Holy Church's cathedral in the kingdom capital", { form: "human", age: "adult", location: "city" }),
      beat("powers", "granted mundane/weak power", "Hajime receives the weakest class, Synergist (transmuter), while his classmates receive powerful combat classes"),
    ],
  },
];

function getExtraCategories(): BeatCategory[] {
  const extra: BeatCategory[] = [];
  const existingIds = new Set(SEED_TAXONOMY.map((c) => c.id));

  for (const anime of SEED_ANIME) {
    for (const b of anime.beats) {
      if (b.stage === "arrival" && b.arrivalDetail) {
        const { form, age, location } = b.arrivalDetail;
        const label = age ? `${form} ${age} in ${location}` : `${form} in ${location}`;
        const id = cat("arrival", label);
        if (!existingIds.has(id)) {
          existingIds.add(id);
          extra.push({
            id,
            stage: "arrival",
            name: label,
            isUserAdded: false,
          });
        }
      }
    }
  }
  return extra;
}

function main() {
  const dataDir = process.env.ISEKAI_DATA_DIR || path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const allCategories = [...SEED_TAXONOMY, ...getExtraCategories()];

  const data: AppData = {
    anime: SEED_ANIME,
    taxonomy: { categories: allCategories },
  };

  const filePath = path.join(dataDir, "isekai-data.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Seed data written to ${filePath}`);
  console.log(`  ${SEED_ANIME.length} anime`);
  console.log(`  ${allCategories.length} categories`);
}

main();
