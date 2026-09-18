export const templateSeeds = [
  { id: 'upper', name: 'Heavy upper', description: 'Compound pushes and pulls. Adjust every set to suit your session.', exercises: [
    { id: 'bench', name: 'Barbell bench press', sets: 4, reps: 5, weight: 0 },
    { id: 'row', name: 'Barbell row', sets: 4, reps: 6, weight: 0 },
    { id: 'ohp', name: 'Overhead press', sets: 3, reps: 6, weight: 0 },
  ] },
  { id: 'lower', name: 'Heavy lower', description: 'A lower-body starting point. Choose your own working loads.', exercises: [
    { id: 'squat', name: 'Barbell back squat', sets: 4, reps: 5, weight: 0 },
    { id: 'rdl', name: 'Romanian deadlift', sets: 3, reps: 6, weight: 0 },
    { id: 'legpress', name: 'Leg press', sets: 3, reps: 8, weight: 0 },
  ] },
  { id: 'pull', name: 'Heavy pull', description: 'Hinge and pull, with room to make it your own.', exercises: [
    { id: 'deadlift', name: 'Barbell deadlift', sets: 3, reps: 4, weight: 0 },
    { id: 'pullup', name: 'Pull-up (added load)', sets: 3, reps: 6, weight: 0 },
    { id: 'supportedrow', name: 'Chest-supported row', sets: 3, reps: 8, weight: 0 },
  ] },
];
export function defaultData(start) {
  return {
    version: 1,
    settings: { programStart: start, phaseNames: ['Foundation', 'Build I', 'Build II', 'Strength I', 'Strength II', 'Review'] },
    workouts: [], metrics: [], supplements: {}, routines: structuredClone(templateSeeds),
  };
}
