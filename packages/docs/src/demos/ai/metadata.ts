import type { DemoMetadata } from '../types';

export const metadata: DemoMetadata = {
  slug: 'ai',
  title: 'YukaJS AI System',
  description: 'AI agents with steering behaviors: patrolling guards, flocking birds, and seeking behavior. Powered by YukaJS game AI library.',
  chips: ['YukaVehicle', 'YukaPath', 'Steering', 'Flocking'],
  features: [
    'Path following with waypoints',
    'Flocking with alignment, cohesion, separation',
    'Seek and arrive behaviors',
    'Wandering with boundary constraints',
  ],
  code: `import { YukaEntityManager, YukaVehicle, YukaPath } from '@jbcom/strata';
import * as YUKA from 'yuka';

<YukaEntityManager>
  <YukaVehicle ref={vehicleRef} maxSpeed={3}>
    <AgentMesh />
  </YukaVehicle>
</YukaEntityManager>

// Add steering behaviors
const followPath = new YUKA.FollowPathBehavior(path);
vehicleRef.current.addBehavior(followPath);

// Flocking behaviors
const alignment = new YUKA.AlignmentBehavior();
const cohesion = new YUKA.CohesionBehavior();
const separation = new YUKA.SeparationBehavior();`,
};
