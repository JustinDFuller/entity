import path from 'path'
import { promises as fs } from 'fs'
import chalk from 'chalk'

let failed = false

const log = console.log
const error = (...messages) => {
  failed = true
  log("\n", chalk.red("Error"), ...messages, "\n")
}

const cwd = p => path.join(process.cwd(), p)

export async function test({ directory }) {
  try {
    await validateDirectory(path.normalize(directory)) 
    if (!failed) {
      log("\nResult:", chalk.green("OK"))
      process.exit(0)
    } else {
      log("\nResult:", chalk.red("FAILED"))
      process.exit(1)
    }
  } catch(e) {
    error("Entities Invalid:", e)
    process.exit(1)
  }
}

async function validateDirectory(directory) {
  log("Validating Entities in:", directory)

  const files = await fs.readdir(cwd(directory), { withFileTypes: true }) 

  for (const f of files) {
    if (f.isFile() && f.name.endsWith(".js")) {
      await validateJSFile(f, { directory, files: files.map(f => f.name) })
    }

    if (f.isDirectory() && !f.name.startsWith(".")) {
      await validateDirectory(path.join(directory, f.name))
    }
  }
}

async function validateJSFile(f, { directory, files }) {
  const relative = path.join(directory, f.name)
  const loc = cwd(relative)
  const r = await import(loc)


  let dir = path.dirname(loc).split(path.sep)
  dir = dir[dir.length - 1]

  if (f.name === "index.js" && !r[dir]) {
    return error(`in ${chalk.dim(relative)}: \n\ttop-level export must match directory ${chalk.dim(dir)}.`)
  }

  const filesInCurrentDir = await fs.readdir(directory, { withFileTypes: true })
  for (const prop in r[dir]) {
    const hasDir = filesInCurrentDir.find(f => f.name.toLowerCase() === prop.toLowerCase())
    const hasFile = filesInCurrentDir.find(f => f.name.toLowerCase() === `${prop.toLowerCase()}.js`)
    if (!hasDir && !hasFile) {
      error(`Expected to find ${chalk.dim(prop)} or ${chalk.dim(prop)}.js, exported from ${chalk.dim(f.name)}`)
    }
  }
}

