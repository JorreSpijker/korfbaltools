import { baseConfig } from "@korfbaltools/config/eslint";

export default [...baseConfig, { ignores: [".next/**", "next-env.d.ts"] }];
