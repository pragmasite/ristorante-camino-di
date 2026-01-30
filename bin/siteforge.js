#!/usr/bin/env node

/**
 * SiteForge CLI — Entry point for the SiteForge build system.
 *
 * Commands:
 *   build    --config <path>   Full build (pipeline + Vite)
 *   prepare  --config <path>   Run pre-build pipeline only
 *   validate --config <path>   Validate config only
 *   dev      --config <path>   Copy config and start dev server
 *
 * Usage:
 *   node bin/siteforge.js build --config examples/atelier-lithos.json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import yaml from "js-yaml";
import { resolve, dirname, basename, join } from "node:path";
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITEFORGE_DIR = resolve(__dirname, "..");
const PIPELINE_DIR = resolve(SITEFORGE_DIR, "pipeline");

// PROJECT_ROOT and derived paths are set dynamically based on command args
// By default, use current working directory as project root
let PROJECT_ROOT = process.cwd();
let GENERATED_DIR = resolve(PROJECT_ROOT, ".generated");
let CONFIG_DEST = resolve(GENERATED_DIR, "site-config.json");
let ASSETS_DIR = resolve(PROJECT_ROOT, "assets");
let OUTPUT_DIR = resolve(PROJECT_ROOT, "dist");

/**
 * Set project root and update all derived paths.
 * Called when a project directory is specified via CLI argument.
 */
function setProjectRoot(dir) {
  PROJECT_ROOT = resolve(process.cwd(), dir);
  GENERATED_DIR = resolve(PROJECT_ROOT, ".generated");
  CONFIG_DEST = resolve(GENERATED_DIR, "site-config.json");
  ASSETS_DIR = resolve(PROJECT_ROOT, "assets");
  OUTPUT_DIR = resolve(PROJECT_ROOT, "dist");
}

// ---------------------------------------------------------------------------
// Config format detection
// ---------------------------------------------------------------------------

function detectConfigFormat(filePath) {
  const ext = filePath.toLowerCase().split('.').pop();
  return (ext === 'yaml' || ext === 'yml') ? 'yaml' : 'json';
}

// ---------------------------------------------------------------------------
// ANSI helpers
// ---------------------------------------------------------------------------

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";

const CHECK = `${GREEN}\u2714${RESET}`;
const CROSS = `${RED}\u2718${RESET}`;
const ARROW = `${CYAN}\u25B6${RESET}`;
const WARN = `${YELLOW}\u26A0${RESET}`;

function log(msg) {
  console.log(msg);
}

function logStep(msg) {
  console.log(`\n${ARROW}  ${BOLD}${msg}${RESET}`);
}

function logSuccess(msg) {
  console.log(`   ${CHECK}  ${msg}`);
}

function logError(msg) {
  console.error(`   ${CROSS}  ${RED}${msg}${RESET}`);
}

function logWarn(msg) {
  console.log(`   ${WARN}  ${YELLOW}${msg}${RESET}`);
}

function logInfo(msg) {
  console.log(`   ${DIM}${msg}${RESET}`);
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { command: null, config: null, projectDir: null, help: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--config" || arg === "-c") {
      i++;
      if (i < args.length) {
        result.config = args[i];
      } else {
        logError("--config flag requires a path argument.");
        process.exit(1);
      }
    } else if (!arg.startsWith("-") && !result.command) {
      result.command = arg;
    } else if (!arg.startsWith("-") && !result.projectDir) {
      // Second positional argument is the project directory
      result.projectDir = arg;
    } else if (!arg.startsWith("-")) {
      logWarn(`Unexpected argument: ${arg}`);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

function printHelp() {
  log(`
${BOLD}${CYAN}SiteForge${RESET} ${DIM}— Static site generator from YAML configuration${RESET}

${BOLD}USAGE${RESET}
  siteforge <command> [project-dir] [--config <path>]

${BOLD}COMMANDS${RESET}
  ${GREEN}build${RESET}      Full build: run pipeline then Vite production build
  ${GREEN}prepare${RESET}    Run the pre-build pipeline only (no Vite build)
  ${GREEN}validate${RESET}   Validate the config file only
  ${GREEN}dev${RESET}        Copy config and start the Vite dev server

${BOLD}ARGUMENTS${RESET}
  ${CYAN}project-dir${RESET}    Path to project directory ${DIM}(optional, defaults to cwd)${RESET}
                   The directory should contain config.yaml and assets/

${BOLD}OPTIONS${RESET}
  ${CYAN}--config, -c${RESET}   Path to site config (.yaml) ${DIM}(optional if config.yaml exists)${RESET}
  ${CYAN}--help, -h${RESET}     Show this help message

${BOLD}PROJECT STRUCTURE${RESET}
  config.yaml      Site configuration (content, theme, sections)
  assets/          Site-specific images and media
  .generated/      Build intermediates (gitignored)
  dist/            Build output (gitignored)

${BOLD}DEFAULT CONFIG${RESET}
  If no --config is specified, SiteForge looks for ${CYAN}config.yaml${RESET} in the
  project directory (or current directory if not specified).

${BOLD}EXAMPLES${RESET}
  ${DIM}# Build a project directory${RESET}
  npm run build ../examples/cotevin/

  ${DIM}# Start dev server for a project${RESET}
  npm run dev ../examples/fcpaysages/

  ${DIM}# Build using config.yaml in current directory${RESET}
  npm run build

  ${DIM}# Build with explicit config path${RESET}
  npm run siteforge build --config /path/to/config.yaml
`);
}

// ---------------------------------------------------------------------------
// Banner
// ---------------------------------------------------------------------------

function printBanner() {
  log(`
${BOLD}${CYAN} ____  _ _       _____
${BOLD}${CYAN}/ ___|(_) |_ ___|  ___|__  _ __ __ _  ___
${BOLD}${CYAN}\\___ \\| | __/ _ \\ |_ / _ \\| '__/ _\` |/ _ \\
${BOLD}${CYAN} ___) | | ||  __/  _| (_) | | | (_| |  __/
${BOLD}${CYAN}|____/|_|\\__\\___|_|  \\___/|_|  \\__, |\\___|
${BOLD}${CYAN}                               |___/${RESET}
${DIM}  One YAML in. One deployable site out.${RESET}
`);
}

// ---------------------------------------------------------------------------
// Config loading & copying
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG_NAME = "config.yaml";

function findDefaultConfig() {
  // Look for config.yaml at project root
  const yamlPath = resolve(PROJECT_ROOT, "config.yaml");
  if (existsSync(yamlPath)) return yamlPath;

  // Also try config.yml for flexibility
  const ymlPath = resolve(PROJECT_ROOT, "config.yml");
  if (existsSync(ymlPath)) return ymlPath;

  return null;
}

function resolveConfigPath(configArg) {
  // If --config provided, use it
  if (configArg) {
    const configPath = resolve(process.cwd(), configArg);
    if (!existsSync(configPath)) {
      logError(`Config file not found: ${configPath}`);
      process.exit(1);
    }
    return configPath;
  }

  // Otherwise, look for site-config.yml in project root
  const defaultConfig = findDefaultConfig();
  if (defaultConfig) {
    return defaultConfig;
  }

  // No config found — show helpful error
  log("");
  logError("No config.yaml found.");
  log("");
  log(`   ${BOLD}To build a site:${RESET}`);
  log(`     1. Create ${CYAN}config.yaml${RESET} in this directory`);
  log(`     2. Run: ${CYAN}npm run build${RESET}`);
  log("");
  log(`   ${BOLD}Or specify a project directory:${RESET}`);
  log(`     ${CYAN}npm run build ../examples/cotevin/${RESET}`);
  log("");
  process.exit(1);
}

function loadConfig(configPath) {
  try {
    const raw = readFileSync(configPath, "utf-8");
    const format = detectConfigFormat(configPath);

    if (format === 'yaml') {
      return yaml.load(raw, {
        filename: configPath,
        schema: yaml.JSON_SCHEMA  // Ensures JSON-compatible output
      });
    }
    return JSON.parse(raw);
  } catch (err) {
    // Enhanced error for YAML with line/column info
    if (err.mark) {
      logError(`YAML parse error at line ${err.mark.line + 1}, column ${err.mark.column + 1}`);
      logError(`  ${err.reason}`);
    } else {
      logError(`Failed to parse config: ${err.message}`);
    }
    process.exit(1);
  }
}

function copyConfigToProject(config) {
  logStep("Writing config to .generated/");

  // Ensure .generated directory exists
  mkdirSync(GENERATED_DIR, { recursive: true });

  logInfo(`-> ${CONFIG_DEST}`);
  writeFileSync(CONFIG_DEST, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  logSuccess("Config written");
}

// ---------------------------------------------------------------------------
// Pipeline steps
// ---------------------------------------------------------------------------

const PIPELINE_STEPS = [
  {
    name: "validate-config",
    label: "Validate configuration",
    file: "validate-config.js",
    required: true,
  },
  {
    name: "download-assets",
    label: "Download remote assets",
    file: "download-assets.js",
    required: false,
  },
  {
    name: "optimize-images",
    label: "Optimize images",
    file: "optimize-images.js",
    required: false,
  },
  {
    name: "generate-metadata",
    label: "Generate metadata",
    file: "generate-metadata.js",
    required: false,
  },
];

function runPipelineStep(step, configPath) {
  const scriptPath = resolve(PIPELINE_DIR, step.file);

  if (!existsSync(scriptPath)) {
    logWarn(`Pipeline script not found: ${step.file} — skipping`);
    return { skipped: true };
  }

  try {
    execSync(`node "${scriptPath}" "${configPath}"`, {
      cwd: PROJECT_ROOT,
      stdio: "pipe",
      env: {
        ...process.env,
        SITEFORGE_CONFIG: configPath,
        SITEFORGE_ROOT: PROJECT_ROOT,
        SITEFORGE_ASSETS: ASSETS_DIR,
        SITEFORGE_GENERATED: GENERATED_DIR,
      },
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.stderr ? err.stderr.toString().trim() : err.message,
    };
  }
}

function runPipeline(configPath, { stepsToRun = null } = {}) {
  const steps = stepsToRun
    ? PIPELINE_STEPS.filter((s) => stepsToRun.includes(s.name))
    : PIPELINE_STEPS;

  logStep("Running pre-build pipeline");
  log("");

  const total = steps.length;
  let passed = 0;
  let skipped = 0;
  let warned = 0;
  let failed = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const index = `${DIM}[${i + 1}/${total}]${RESET}`;

    process.stdout.write(`   ${index} ${step.label}...`);

    const result = runPipelineStep(step, configPath);

    if (result.skipped) {
      console.log(` ${YELLOW}skipped${RESET}`);
      skipped++;
    } else if (result.success) {
      console.log(` ${CHECK}`);
      passed++;
    } else if (!step.required) {
      console.log(` ${WARN} ${YELLOW}warning${RESET}`);
      logWarn(result.error || "(non-blocking)");
      warned++;
    } else {
      console.log(` ${CROSS}`);
      logError(result.error);
      failed++;
    }
  }

  log("");
  log(
    `   ${BOLD}Pipeline complete:${RESET} ` +
      `${GREEN}${passed} passed${RESET}` +
      `${warned > 0 ? `, ${YELLOW}${warned} warning(s)${RESET}` : ""}` +
      `${skipped > 0 ? `, ${YELLOW}${skipped} skipped${RESET}` : ""}` +
      `, ${failed > 0 ? `${RED}${failed} failed${RESET}` : `${GREEN}0 failed${RESET}`}`
  );

  if (failed > 0) {
    logError("Pipeline failed. Fix errors above before building.");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Vite build
// ---------------------------------------------------------------------------

function runViteBuild() {
  logStep("Running Vite production build");
  log("");

  try {
    // Run Vite from the siteforge directory (where vite.config.ts lives)
    // but output to the project root's dist/
    execSync("npx vite build", {
      cwd: SITEFORGE_DIR,
      stdio: "inherit",
      env: {
        ...process.env,
        SITEFORGE_PROJECT_ROOT: PROJECT_ROOT,
      },
    });
    logSuccess("Vite build complete");
    return true;
  } catch (err) {
    logError("Vite build failed.");
    return false;
  }
}

// ---------------------------------------------------------------------------
// Vite dev server
// ---------------------------------------------------------------------------

function runViteDev() {
  logStep("Starting Vite dev server");
  log("");

  // Run Vite from the siteforge directory (where vite.config.ts lives)
  const child = spawn("npx", ["vite"], {
    cwd: SITEFORGE_DIR,
    stdio: "inherit",
    env: {
      ...process.env,
      SITEFORGE_PROJECT_ROOT: PROJECT_ROOT,
    },
    shell: true,
  });

  child.on("error", (err) => {
    logError(`Failed to start dev server: ${err.message}`);
    process.exit(1);
  });

  child.on("close", (code) => {
    if (code !== 0 && code !== null) {
      logError(`Dev server exited with code ${code}`);
      process.exit(code);
    }
  });

  // Forward SIGINT / SIGTERM to child process for clean shutdown
  process.on("SIGINT", () => {
    child.kill("SIGINT");
  });
  process.on("SIGTERM", () => {
    child.kill("SIGTERM");
  });
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdBuild(configPath) {
  const startTime = Date.now();
  const config = loadConfig(configPath);

  log(
    `${DIM}   Site:${RESET} ${BOLD}${config.name || basename(configPath)}${RESET}`
  );
  log(`${DIM}   Config:${RESET} ${configPath}`);

  copyConfigToProject(config);
  runPipeline(CONFIG_DEST);

  const buildOk = runViteBuild();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  log("");
  if (buildOk) {
    log(
      `${BOLD}${GREEN}\u2728 Build successful!${RESET} ${DIM}(${elapsed}s)${RESET}`
    );
    log(`${DIM}   Output: ${OUTPUT_DIR}${RESET}`);
  } else {
    log(`${BOLD}${RED}Build failed.${RESET} ${DIM}(${elapsed}s)${RESET}`);
    process.exit(1);
  }
}

function cmdPrepare(configPath) {
  const config = loadConfig(configPath);

  log(
    `${DIM}   Site:${RESET} ${BOLD}${config.name || basename(configPath)}${RESET}`
  );
  log(`${DIM}   Config:${RESET} ${configPath}`);

  copyConfigToProject(config);
  runPipeline(CONFIG_DEST);

  log("");
  log(`${BOLD}${GREEN}Pipeline complete.${RESET} Ready for build.`);
}

function cmdValidate(configPath) {
  const config = loadConfig(configPath);

  log(
    `${DIM}   Site:${RESET} ${BOLD}${config.name || basename(configPath)}${RESET}`
  );
  log(`${DIM}   Config:${RESET} ${configPath}`);

  copyConfigToProject(config);
  runPipeline(CONFIG_DEST, { stepsToRun: ["validate-config"] });

  log("");
  log(`${BOLD}${GREEN}Validation complete.${RESET}`);
}

function cmdDev(configPath) {
  const config = loadConfig(configPath);

  log(
    `${DIM}   Site:${RESET} ${BOLD}${config.name || basename(configPath)}${RESET}`
  );
  log(`${DIM}   Config:${RESET} ${configPath}`);

  copyConfigToProject(config);
  runViteDev();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const { command, config, projectDir, help } = parseArgs(process.argv);

  // Show help if requested or no command given
  if (help || !command) {
    printBanner();
    printHelp();
    process.exit(help ? 0 : 1);
  }

  // If a project directory is specified, update PROJECT_ROOT and derived paths
  if (projectDir) {
    const resolvedDir = resolve(process.cwd(), projectDir);
    if (!existsSync(resolvedDir)) {
      logError(`Project directory not found: ${resolvedDir}`);
      process.exit(1);
    }
    setProjectRoot(resolvedDir);
  }

  printBanner();

  const configPath = resolveConfigPath(config);

  switch (command) {
    case "build":
      cmdBuild(configPath);
      break;

    case "prepare":
      cmdPrepare(configPath);
      break;

    case "validate":
      cmdValidate(configPath);
      break;

    case "dev":
      cmdDev(configPath);
      break;

    default:
      logError(`Unknown command: ${command}`);
      log(`${DIM}   Run ${CYAN}siteforge --help${RESET}${DIM} for usage.${RESET}`);
      process.exit(1);
  }
}

main();
