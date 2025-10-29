/*
  Quick fixer for common mojibake sequences (UTF-8 read as Latin-1/CP1252).
  Usage: node scripts/fix-mojibake.cjs
*/
const fs = require('fs')
const path = require('path')

const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.css'])

const MAP = new Map(Object.entries({
  'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
  'Ã�': 'Á', 'Ã‰': 'É', 'Ã�': 'Í', 'Ã“': 'Ó', 'Ãš': 'Ú',
  'Ã£': 'ã', 'Ãµ': 'õ', 'Ã§': 'ç', 'Ã‡': 'Ç',
  'Ã¢': 'â', 'Ãª': 'ê', 'Ã´': 'ô', 'Ã ': 'à', 'Ã€': 'À', 'Ãº': 'ú',
  'Ã': 'Á', 'Ã': 'É', 'Ã': 'Í', 'Ã': 'Ó', 'Ã': 'Ú',
  'Ã': 'Ã', 'Ã': 'Õ', 'Ã§': 'ç', 'Ã£': 'ã',
  'â¢': '•', 'â': '–', 'â': '—', 'â': '’', 'â': '“', 'â': '”',
  'â': "'", 'â¦': '…', 'â': '•',
  'Âº': 'º', 'Âª': 'ª', 'Â°': '°', 'Â£': '£', 'Â¥': '¥', 'Â©': '©',
}))

function fixText(s) {
  let out = s
  for (const [bad, good] of MAP) out = out.split(bad).join(good)
  // very common sequences seen in repo
  out = out.replace(/In��cio/g, 'Início')
  out = out.replace(/Descri��/g, 'Descrição')
  out = out.replace(/Caracter��sticas/g, 'Características')
  out = out.replace(/avalia����es/g, 'avaliações')
  out = out.replace(/Devolu��/g, 'Devolução')
  out = out.replace(/grÃ¡tis|grǭtis/g, 'grátis')
  out = out.replace(/regiÃ£o|regiǜo/g, 'região')
  out = out.replace(/nÃ£o|nǜo/g, 'não')
  out = out.replace(/Boleto banc[^"]+vista/g, 'Boleto bancário (à vista)')
  out = out.replace(/Cart[^"]+cr[^"]+dito/g, 'Cartão de crédito')
  return out
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const stat = fs.statSync(p)
    if (stat.isDirectory()) walk(p)
    else if (exts.has(path.extname(name))) {
      let txt = fs.readFileSync(p, 'utf8')
      const fixed = fixText(txt)
      if (fixed !== txt) {
        fs.writeFileSync(p, fixed, 'utf8')
        console.log('fixed', p)
      }
    }
  }
}

walk(path.join(__dirname, '..'))
console.log('Done fixing common mojibake sequences.')

