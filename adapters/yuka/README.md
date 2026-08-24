# Strata Yuka adapter

`strata-game-library/yuka` is Strata's optional integration for [Yuka](https://mugen87.github.io/yuka/): steering behaviors, navigation meshes, entity management, and state machines for React Three Fiber scenes.

Install the public package and the adapter's peers:

```bash
npm install strata-game-library yuka three react @react-three/fiber
```

```ts
import { YukaEntityManager, YukaVehicle, useSeek } from "strata-game-library/yuka";
```

Yuka is never loaded by `strata-game-library`, `strata-game-library/core`, or `strata-game-library/r3f`. Import this subpath only when a game chooses Yuka as its AI/navigation runtime.

See the [Yuka adapter guide](https://strata.game/adapters/yuka/) for setup and examples.
