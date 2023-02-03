import { NeatGenome } from "./neat/genome";
import { NeatInnovationTracker } from "./neat/innovation";
import { visualiseGenome } from "./visualiser/visualiseGenome";

const tracker = new NeatInnovationTracker();

const parentGenome1 = new NeatGenome(3, 3, tracker);
const parentGenome2 = new NeatGenome(3, 3, tracker);

for (let i = 0; i < 100; i++) {
  parentGenome1.mutate();
  parentGenome2.mutate();
}

visualiseGenome(parentGenome1, "parentGenome1.png");
visualiseGenome(parentGenome2, "parentGenome2.png");

const childGenome = NeatGenome.crossover(parentGenome1, parentGenome2);
visualiseGenome(childGenome, "childGenome.png");
