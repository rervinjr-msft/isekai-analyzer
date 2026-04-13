import { BeatCategory, StoryStage } from "@/types";

function cat(stage: StoryStage, name: string): BeatCategory {
  return {
    id: `${stage}-${name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`,
    stage,
    name,
    isUserAdded: false,
  };
}

export const SEED_TAXONOMY: BeatCategory[] = [
  // Departure
  cat("departure", "death by vehicle"),
  cat("departure", "natural death"),
  cat("departure", "murdered"),
  cat("departure", "suicide"),
  cat("departure", "old age death"),
  cat("departure", "summoned by ritual"),
  cat("departure", "summoned as part of a group"),
  cat("departure", "logged into game"),
  cat("departure", "fell into portal"),

  // Transition
  cat("transition", "meets deity/god"),
  cat("transition", "meets guide"),
  cat("transition", "reincarnation process"),
  cat("transition", "transported instantly"),
  cat("transition", "gradual realization"),

  // Arrival (sub-field model - these are example composite categories)
  cat("arrival", "human child in city"),
  cat("arrival", "human child in wilderness"),
  cat("arrival", "human adult in city"),
  cat("arrival", "human adult in wilderness"),
  cat("arrival", "human adult in dungeon"),
  cat("arrival", "human baby in city"),
  cat("arrival", "non-human in wilderness"),
  cat("arrival", "non-human in dungeon"),
  cat("arrival", "non-human in cave"),

  // Powers
  cat("powers", "granted unique skill"),
  cat("powers", "granted mundane/weak power"),
  cat("powers", "retains past-life knowledge"),
  cat("powers", "given cheat-level power"),
  cat("powers", "no special ability"),
  cat("powers", "gains class/job system"),
];
