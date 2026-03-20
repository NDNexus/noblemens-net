import fs from "fs"
import path from "path"

const ROOT = "./"

function getHTMLFiles(dir: string): string[] {
    let results: string[] = []
    const files = fs.readdirSync(dir)

    files.forEach(file => {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            if (["node_modules", "dist", "templates", "scripts"].includes(file)) return
            results = results.concat(getHTMLFiles(fullPath))
        } else if (file.endsWith(".html")) {
            results.push(fullPath)
        }
    })

    return results
}

function fixIncludes(html: string): string {
    return html.replace(
        /<include([^>]*)>(?!\s*<\/include>)/gi,
        "<include$1></include>"
    )
}

const files = getHTMLFiles(ROOT)

files.forEach(file => {
    let html = fs.readFileSync(file, "utf-8")
    html = fixIncludes(html)
    fs.writeFileSync(file, html)
    console.log("✔ fixed:", file)
})

console.log("\n✅ All includes normalized.\n")