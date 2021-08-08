const { promises: fs } = require('fs')
const path = require('path')
const { dim, red } = require('chalk')

let failed = false

const log = console.log
const error = m => {
  failed = true
  log(`\n${red("Error")} ${m}\n`)
}

const cwd = p => path.join(process.cwd(), p)

async function test({ directory }) {
  try {
    await validateDirectory(path.normalize(directory)) 
    if (!failed) {
      log("\nResult:", green("OK"))
      process.exit(0)
    } else {
      log("\nResult:", red("FAILED"))
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
  const r = require(loc)


  let dir = path.dirname(loc).split(path.sep)
  dir = dir[dir.length - 1]

  if (f.name === "index.js" && !r[dir]) {
    return error(`in ${dim(relative)}: \n\ttop-level export must match directory ${dim(dir)}.`)
  }

  const filesInCurrentDir = await fs.readdir(directory, { withFileTypes: true })
  for (const prop in r[dir]) {
    const hasDir = filesInCurrentDir.find(f => f.name === prop)
    const hasFile = filesInCurrentDir.find(f => f.name === `${prop}.js`)
    if (!hasDir && !hasFile) {
      error(`Expected to find ${dim(prop)} or ${dim(prop)}.js, exported from ${dim(f.name)}`)
    }
  }
}

module.exports = {
  test,
}

