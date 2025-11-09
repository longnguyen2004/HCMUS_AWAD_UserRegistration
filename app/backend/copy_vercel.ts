import cpy from "cpy";

if (process.env.CI && process.env.VERCEL)
{
    cpy("dist/*.js", "../../api");
}
