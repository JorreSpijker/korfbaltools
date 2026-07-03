import { baseConfig } from "@korfbaltools/config/eslint";

export default [...baseConfig, { ignores: ["src/generated/**"] }];
