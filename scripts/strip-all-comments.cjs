const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
function tryRequireTypescript() {
    const candidates = [
        path.join(ROOT, "node_modules/typescript"),
        path.join(ROOT, "apps/web/node_modules/typescript"),
    ];
    for (const c of candidates) {
        try {
            return require(c);
        }
        catch {
        }
    }
    throw new Error("Install dependencies so `typescript` is available (workspace `node_modules`).");
}
const ts = tryRequireTypescript();
const SKIP_DIR_NAMES = new Set([
    "node_modules",
    ".next",
    ".git",
    "dist",
    "coverage",
    "build",
]);
const SKIP_FILE_RE = /\.(min\.(js|css)|bundle\.min\.js)$/;
function walk(dir, out = []) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    }
    catch {
        return out;
    }
    for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (SKIP_DIR_NAMES.has(e.name))
                continue;
            walk(p, out);
        }
        else {
            out.push(p);
        }
    }
    return out;
}
function stripHtmlComments(src) {
    return src.replace(/<!--[\s\S]*?-->/g, "");
}
function stripCssComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "");
}
function stripPrismaLineComments(src) {
    return src
        .split("\n")
        .map((line) => line.replace(/\/\/.*$/, ""))
        .join("\n");
}
function stripEnvStyleComments(src) {
    return src
        .split("\n")
        .filter((line) => !/^\s*#/.test(line))
        .join("\n");
}
function stripYamlFullLineHashComments(src) {
    return src
        .split("\n")
        .filter((line) => !/^\s*#/.test(line))
        .join("\n");
}
function stripWithTsPrinter(filePath, sourceText) {
    const ext = path.extname(filePath);
    const scriptKind = ext === ".tsx"
        ? ts.ScriptKind.TSX
        : ext === ".jsx"
            ? ts.ScriptKind.JSX
            : ext === ".js" || ext === ".cjs" || ext === ".mjs"
                ? ts.ScriptKind.JS
                : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, scriptKind);
    const printer = ts.createPrinter({
        removeComments: true,
        newLine: ts.NewLineKind.LineFeed,
    });
    return printer.printFile(sf);
}
function shouldProcess(absPath) {
    const rel = path.relative(ROOT, absPath).replace(/\\/g, "/");
    if (SKIP_FILE_RE.test(absPath))
        return false;
    if (rel === "apps/web/next-env.d.ts")
        return false;
    if (rel.includes("/node_modules/"))
        return false;
    return true;
}
function main() {
    const roots = [ROOT];
    const files = [...new Set(roots.flatMap((r) => (fs.existsSync(r) ? walk(r) : [])).filter(shouldProcess))];
    let changed = 0;
    for (const file of files) {
        const ext = path.extname(file);
        let next;
        const raw = fs.readFileSync(file, "utf8");
        if (ext === ".html") {
            next = stripHtmlComments(raw);
        }
        else if (ext === ".css") {
            next = stripCssComments(raw);
        }
        else if (ext === ".prisma") {
            next = stripPrismaLineComments(raw);
        }
        else if (ext === ".yml" || ext === ".yaml") {
            next = stripYamlFullLineHashComments(raw);
        }
        else if ((path.basename(file) === ".env.example" || path.basename(file) === ".env.sample") &&
            path.relative(ROOT, file) !== ".env.example") {
            next = stripEnvStyleComments(raw);
        }
        else if (ext === ".ts" ||
            ext === ".tsx" ||
            ext === ".js" ||
            ext === ".cjs" ||
            ext === ".mjs" ||
            ext === ".jsx") {
            try {
                next = stripWithTsPrinter(file, raw);
            }
            catch (e) {
                console.error("Skip (parse error):", path.relative(ROOT, file), e.message);
                continue;
            }
        }
        else {
            continue;
        }
        if (next !== raw) {
            fs.writeFileSync(file, next, "utf8");
            changed++;
            console.log("stripped:", path.relative(ROOT, file));
        }
    }
    console.log("Done. Files updated:", changed);
}
main();
