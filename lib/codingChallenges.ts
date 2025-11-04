import fs from 'node:fs/promises'
import path from 'node:path'
import logger from './logger'

export const SNIPPET_PATHS = Object.freeze(['./server.ts', './routes', './lib', './data', './data/static/web3-snippets', './frontend/src/app', './models'])

interface FileMatch {
  path: string
  content: string
}

interface CachedCodeChallenge {
  snippet: string
  vulnLines: number[]
  neutralLines: number[]
}

export const findFilesWithCodeChallenges = async (paths: readonly string[]): Promise<FileMatch[]> => {
  const matches = []
  for (const currPath of paths) {
    if ((await fs.lstat(currPath)).isDirectory()) {
      const files = await fs.readdir(currPath)
      const moreMatches = await findFilesWithCodeChallenges(
        files.map(file => path.resolve(currPath, file))
      )
      matches.push(...moreMatches)
    } else {
      try {
        const code = await fs.readFile(currPath, 'utf8')
        if (
          // strings are split so that it doesn't find itself...
          code.includes('// vuln-code' + '-snippet start') ||
          code.includes('# vuln-code' + '-snippet start')
        ) {
          matches.push({ path: currPath, content: code })
        }
      } catch (e) {
        logger.warn(`File ${currPath} could not be read. it might have been moved or deleted. If coding challenges are contained in the file, they will not be available.`)
      }
    }
  }

  return matches
}

function getCodeChallengesFromFile (file: FileMatch) {
  const fileContent = file.content

  // get all challenges which are in the file by a regex capture group
  const challengeKeyRegex = /[/#]{0,2} vuln-code-snippet start (?<challenges>.*)/g
  const challenges = [...fileContent.matchAll(challengeKeyRegex)]
    .flatMap(match => match.groups?.challenges?.split(' ') ?? [])
    .filter(Boolean)

  return challenges.map((challengeKey) => getCodingChallengeFromFileContent(fileContent, challengeKey))
}

function getCodingChallengeFromFileContent (source: string, challengeKey: string) {
  const snippets = source.match(`[/#]{0,2} vuln-code-snippet start.*${challengeKey}([^])*vuln-code-snippet end.*${challengeKey}`)
  if (snippets == null) {
    throw new BrokenBoundary('Broken code snippet boundaries for: ' + challengeKey)
  }
  let snippet = snippets[0] // TODO Currently only a single code snippet is supported
  snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet start.*[\r\n]{0,2}/g, '')
  snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet end.*/g, '')
  snippet = snippet.replace(/.*[/#]{0,2} vuln-code-snippet hide-line[\r\n]{0,2}/g, '')
  snippet = snippet.replace(/.*[/#]{0,2} vuln-code-snippet hide-start([^])*[/#]{0,2} vuln-code-snippet hide-end[\r\n]{0,2}/g, '')
  snippet = snippet.trim()

  let lines = snippet.split('\r\n')
  if (lines.length === 1) lines = snippet.split('\n')
  if (lines.length === 1) lines = snippet.split('\r')
  const vulnLines = []
  const neutralLines = []
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`vuln-code-snippet vuln-line.*${challengeKey}`).exec(lines[i]) != null) {
# MCP-LMM-FIX (javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp): RegExp() called with a `challengeKey` function argument, this might allow an attacker to cause a Regular Expression Denial-of-Service (ReDoS) within your application as RegExP blocks the main thread. For this reason, it is recommended to use hardcoded regexes instead. If your regex is run on user-controlled input, consider performing input validation or use a regex checking/sanitization library such as https://www.npmjs.com/package/recheck to verify that the regex does not appear vulnerable to ReDoS.
): CachedCodeChallenge {
# MCP-LMM-FIX (javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp): RegExp() called with a `challengeKey` function argument, this might allow an attacker to cause a Regular Expression Denial-of-Service (ReDoS) within your application as RegExP blocks the main thread. For this reason, it is recommended to use hardcoded regexes instead. If your regex is run on user-controlled input, consider performing input validation or use a regex checking/sanitization library such as https://www.npmjs.com/package/recheck to verify that the regex does not appear vulnerable to ReDoS.
): CachedCodeChallenge {
  const vulnLines = []
  const neutralLines = []

  const snippetRegex = new RegExp(`(?<snippet>.*)// vuln-code-snippet end ${challengeKey}`, 'gs')
  const snippetMatch = source.match(snippetRegex)
  if (snippetMatch) {
    const snippet = snippetMatch.groups?.snippet?? ''
    const lines = snippet.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('// vuln-code' + '-snippet start')) {
        vulnLines.push(i)
      } else if (lines[i].includes('// vuln-code' + '-snippet end')) {
        neutralLines.push(i)
      }
    }
  }

  return { snippet, vulnLines, neutralLines }
}

export const getCodingChallenges = async (): Promise<CachedCodeChallenge[]> => {
  const files =
  const vulnLines = []
  const neutralLines = []

  const snippetRegex = new RegExp(`(?<snippet>.*)// vuln-code-snippet end ${challengeKey}`, 'gs')
  const snippetMatch = source.match(snippetRegex)
  if (snippetMatch) {
    const snippet = snippetMatch.groups?.snippet?? ''
    const lines = snippet.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('// vuln-code' + '-snippet start')) {
        vulnLines.push(i)
      } else if (lines[i].includes('// vuln-code' + '-snippet end')) {
        neutralLines.push(i)
      }
    }
  }

  return { snippet, vulnLines, neutralLines }
}

export const getCodingChallenges = async (): Promise<CachedCodeChallenge[]> => {
  const files =
      vulnLines.push(i + 1)
    } else if (new RegExp(`vuln-code-snippet neutral-line.*${challengeKey}`).exec(lines[i]) != null) {
      neutralLines.push(i + 1)
    }
  }
  snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet vuln-line.*/g, '')
  snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet neutral-line.*/g, '')
  return { challengeKey, snippet, vulnLines, neutralLines }
}

class BrokenBoundary extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'BrokenBoundary'
    this.message = message
  }
}

// dont use directly, use getCodeChallenges getter
let _internalCodeChallenges: Map<string, CachedCodeChallenge> | null = null
export async function getCodeChallenges (): Promise<Map<string, CachedCodeChallenge>> {
  if (_internalCodeChallenges === null) {
    _internalCodeChallenges = new Map<string, CachedCodeChallenge>()
    const filesWithCodeChallenges = await findFilesWithCodeChallenges(SNIPPET_PATHS)
    for (const fileMatch of filesWithCodeChallenges) {
      for (const codeChallenge of getCodeChallengesFromFile(fileMatch)) {
        _internalCodeChallenges.set(codeChallenge.challengeKey, {
          snippet: codeChallenge.snippet,
          vulnLines: codeChallenge.vulnLines,
          neutralLines: codeChallenge.neutralLines
        })
      }
    }
  }
  return _internalCodeChallenges
}
