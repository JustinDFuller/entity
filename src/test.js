import path from 'path'
import { promises as fs } from 'fs'
import chalk from 'chalk'

let failed = false
let errored = false

const log = (...args) =>{
  console.log(...args)
}
const error = (...messages) => {
  log("\n", chalk.red("Error"), ...messages)
}

const errors = []

const cwd = p => path.join(process.cwd(), p)

export async function test({ directory }) {
  try {
    await validateDirectory(path.normalize(directory)) 
    
    if (errors.length) {
      for (const e of errors) {
        error(e)
      }
      log("\nEntities", chalk.red("FAILED"))
    } else {
      log("Entities OK")
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

async function validateJSFile(f, { directory }) {
  try {
    const relative = path.join(directory, f.name)
    const loc = cwd(relative)

    const r = await import(loc)

    if (!Object.keys(r).length) {
      errors.push(`in ${chalk.dim(relative)}: \n\tExpected module to have exports.`)
    }

    let dir = path.dirname(loc).split(path.sep)
    dir = dir[dir.length - 1]

    if (f.name === "index.js" && !r[dir]) {
      errors.push(`in ${chalk.dim(relative)}: \n\tExport must match directory ${chalk.dim(dir)}.`)
      return
    }

    const filesInCurrentDir = await fs.readdir(directory, { withFileTypes: true })
    for (const prop in r[dir]) {
      const hasDir = filesInCurrentDir.find(f => f.name.toLowerCase() === prop.toLowerCase())
      const hasFile = filesInCurrentDir.find(f => f.name.toLowerCase() === `${prop.toLowerCase()}.js`)
      if (!hasDir && !hasFile) {
        errors.push(`in ${chalk.dim(relative)}: \n\tExpected to find ${chalk.dim(prop + "(.js)")} in this directory.`)
      }
    }
  } catch(e) {
    errors.push(`Error parsing ${chalk.dim(directory + "/" + f.name)}: ${e.toString()}`)
  }
}

