/**
 * PROPOSED material. Nothing here is Kairos Universe canon.
 * Every item awaits author approval; see docs/organization/ASTERION_PROPOSED_POSITIONING.md.
 * Confirmed company facts come from canon-snapshot.json, never from this file.
 */

export interface Principle {
  id: string;
  name: string;
  statement: string;
  practice: string;
}

export const principles: readonly Principle[] = [
  {
    id: "long-term-systems",
    name: "Long-term systems",
    statement: "Plan for the third year, not the next announcement.",
    practice:
      "Infrastructure is sized for years of use and renewed on a schedule, so it is never replaced in a hurry.",
  },
  {
    id: "reliability",
    name: "Reliability",
    statement: "A system people depend on should be uneventful to operate.",
    practice:
      "Failure modes are written down before launch, and every critical path has a fallback that has actually been used.",
  },
  {
    id: "precision",
    name: "Precision",
    statement: "Measure the thing you intend to change.",
    practice:
      "Terms are defined once. Numbers carry their units, their source, and the date they were taken.",
  },
  {
    id: "practical-implementation",
    name: "Practical implementation",
    statement: "A design is finished when someone else can run it.",
    practice:
      "Documentation and training are part of delivery, not a follow-up task.",
  },
  {
    id: "research-and-experimentation",
    name: "Research and experimentation",
    statement: "Keep experiments small, labelled, and apart from production.",
    practice:
      "Results are reported with what was tried, what was measured, and what did not work.",
  },
] as const;

export type DisciplineDiagram =
  | "computation"
  | "simulation"
  | "decision"
  | "infrastructure"
  | "intelligence"
  | "research";

export interface Discipline {
  id: string;
  index: string;
  name: string;
  purpose: string;
  question: string;
  diagram: DisciplineDiagram;
}

export const disciplines: readonly Discipline[] = [
  {
    id: "computational-systems",
    index: "S-01",
    name: "Computational systems",
    purpose:
      "Software and hardware designed together around a defined workload, with its limits stated up front.",
    question: "What does this workload need, and what will it never be asked to do?",
    diagram: "computation",
  },
  {
    id: "simulation-and-modeling",
    index: "S-02",
    name: "Simulation and modeling",
    purpose:
      "Models of processes that are too slow, costly, or risky to test directly, with their assumptions printed beside the output.",
    question: "If this assumption is wrong, how far does the answer move?",
    diagram: "simulation",
  },
  {
    id: "decision-support",
    index: "S-03",
    name: "Decision-support technology",
    purpose:
      "Tools that put the relevant evidence in front of the person who has to decide, and leave the decision with them.",
    question: "What does the decision-maker need to see, and in what order?",
    diagram: "decision",
  },
  {
    id: "infrastructure-software",
    index: "S-04",
    name: "Infrastructure software",
    purpose:
      "The scheduling, storage, and access control that other teams build on and rarely think about.",
    question: "What breaks first when demand doubles?",
    diagram: "infrastructure",
  },
  {
    id: "applied-machine-intelligence",
    index: "S-05",
    name: "Applied machine intelligence",
    purpose:
      "Learned models used for narrow, reviewable tasks, with a named person accountable for each result.",
    question: "Can a reviewer tell, quickly, when the model is wrong?",
    diagram: "intelligence",
  },
  {
    id: "research-and-systems-engineering",
    index: "S-06",
    name: "Research and systems engineering",
    purpose:
      "Small, documented experiments that decide what is worth building, and the engineering discipline to build it once that is decided.",
    question: "What is the cheapest experiment that could prove this idea wrong?",
    diagram: "research",
  },
] as const;
