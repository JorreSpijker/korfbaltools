import { baseConfig } from "./eslint/index.js";

export default [...baseConfig, { ignores: ["tailwind/*.cjs"] }];
