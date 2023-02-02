import { NeatGenome } from "./neat/genome";
import { NeatInnovationTracker } from "./neat/innovation";
import { visualiseGenome } from "./visualiser/visualiseGenome";

const genome = new NeatGenome(3, 1, new NeatInnovationTracker());

for (let i = 0; i < 300; i++) genome.mutate();

visualiseGenome(genome);
