import { spawnSync } from "node:child_process"
import { join } from "node:path"

const writeTools = new Set(["edit", "write", "apply_patch", "patch", "multiedit"])

export const SecurityScanAfterToolUse = async ({ worktree, directory }) => {
  const cwd = worktree || directory
  const script = join(cwd, "scripts/security-scan.mjs")

  return {
    "tool.execute.after": async (input) => {
      if (!writeTools.has(input.tool)) {
        return
      }

      const result = spawnSync("node", [script], {
        cwd,
        encoding: "utf8",
      })

      if (result.status !== 0) {
        throw new Error(
          [
            "Security scan failed after tool update.",
            result.stderr.trim(),
            result.stdout.trim(),
          ].filter(Boolean).join("\n"),
        )
      }
    },
  }
}
