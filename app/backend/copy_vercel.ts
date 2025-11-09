import cpy from "cpy";

if (process.env.CI && process.env.VERCEL)
{
    cpy("dist/index.js", "../../");
}
