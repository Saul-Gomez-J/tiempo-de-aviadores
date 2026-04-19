import { marked, type Token, type Tokens } from 'marked'

interface LexicalNode {
  type: string
  version: number
  [key: string]: unknown
}

interface LexicalTextNode extends LexicalNode {
  type: 'text'
  text: string
  format: number
  detail: number
  mode: string
  style: string
}

interface LexicalRoot {
  root: {
    type: 'root'
    version: 1
    children: LexicalNode[]
    direction: null
    format: ''
    indent: 0
  }
}

// Format flags: bold=1, italic=2, strikethrough=4, underline=8, code=16
function textNode(text: string, format: number = 0): LexicalTextNode {
  return {
    type: 'text',
    text,
    format,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function paragraphNode(children: LexicalNode[]): LexicalNode {
  return {
    type: 'paragraph',
    version: 1,
    children,
    direction: null,
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
  }
}

function headingNode(tag: string, children: LexicalNode[]): LexicalNode {
  return {
    type: 'heading',
    version: 1,
    tag,
    children,
    direction: null,
    format: '',
    indent: 0,
  }
}

function listNode(ordered: boolean, children: LexicalNode[]): LexicalNode {
  return {
    type: 'list',
    version: 1,
    listType: ordered ? 'number' : 'bullet',
    start: 1,
    tag: ordered ? 'ol' : 'ul',
    children,
    direction: null,
    format: '',
    indent: 0,
  }
}

function listItemNode(children: LexicalNode[]): LexicalNode {
  return {
    type: 'listitem',
    version: 1,
    value: 1,
    children,
    direction: null,
    format: '',
    indent: 0,
  }
}

function quoteNode(children: LexicalNode[]): LexicalNode {
  return {
    type: 'quote',
    version: 1,
    children,
    direction: null,
    format: '',
    indent: 0,
  }
}

function horizontalRuleNode(): LexicalNode {
  return {
    type: 'horizontalrule',
    version: 1,
  }
}

function linkNode(url: string, children: LexicalNode[]): LexicalNode {
  return {
    type: 'link',
    version: 3,
    url,
    children,
    direction: null,
    format: '',
    indent: 0,
    rel: 'noopener',
    target: null,
  }
}

function uploadNode(mediaId: number): LexicalNode {
  return {
    type: 'upload',
    version: 3,
    value: { id: mediaId },
    relationTo: 'media',
    fields: null,
    format: '',
  }
}

function codeBlockNode(code: string, language: string): LexicalNode {
  return {
    type: 'block',
    version: 2,
    fields: {
      blockType: 'Code',
      code,
      language: language || 'plaintext',
    },
    format: '',
  }
}

// Parse inline markdown tokens to Lexical text nodes
function parseInlineTokens(tokens: Token[]): LexicalNode[] {
  const nodes: LexicalNode[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        nodes.push(textNode(token.text))
        break
      case 'strong':
        if (token.tokens) {
          for (const child of parseInlineTokens(token.tokens)) {
            if ('format' in child && typeof child.format === 'number') {
              child.format |= 1 // bold
            }
            nodes.push(child)
          }
        } else {
          nodes.push(textNode(token.text, 1))
        }
        break
      case 'em':
        if (token.tokens) {
          for (const child of parseInlineTokens(token.tokens)) {
            if ('format' in child && typeof child.format === 'number') {
              child.format |= 2 // italic
            }
            nodes.push(child)
          }
        } else {
          nodes.push(textNode(token.text, 2))
        }
        break
      case 'del':
        if (token.tokens) {
          for (const child of parseInlineTokens(token.tokens)) {
            if ('format' in child && typeof child.format === 'number') {
              child.format |= 4 // strikethrough
            }
            nodes.push(child)
          }
        } else {
          nodes.push(textNode(token.text, 4))
        }
        break
      case 'codespan':
        nodes.push(textNode(token.text, 16)) // code
        break
      case 'link':
        nodes.push(linkNode(token.href, token.tokens ? parseInlineTokens(token.tokens) : [textNode(token.text)]))
        break
      case 'image':
        // Images in inline context - skip (handled at block level)
        break
      case 'br':
        nodes.push({ type: 'linebreak', version: 1 })
        break
      default:
        if ('text' in token && typeof token.text === 'string') {
          nodes.push(textNode(token.text))
        }
    }
  }

  return nodes
}

function processListItems(items: Tokens.ListItem[], ordered: boolean): LexicalNode {
  const listItems = items.map((item) => {
    const children: LexicalNode[] = []
    if (item.tokens) {
      for (const token of item.tokens) {
        if (token.type === 'text' && 'tokens' in token && token.tokens) {
          children.push(...parseInlineTokens(token.tokens))
        } else if (token.type === 'list') {
          // Nested list
          children.push(processListItems(token.items, token.ordered))
        } else if ('tokens' in token && token.tokens) {
          children.push(...parseInlineTokens(token.tokens))
        } else if ('text' in token) {
          children.push(textNode(token.text as string))
        }
      }
    }
    return listItemNode(children.length > 0 ? children : [textNode(item.text)])
  })

  return listNode(ordered, listItems)
}

// Main converter
export function markdownToLexical(
  markdown: string,
  imageMap: Record<string, number> = {},
): LexicalRoot {
  const tokens = marked.lexer(markdown)
  const children: LexicalNode[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        children.push(
          headingNode(`h${token.depth}`, token.tokens ? parseInlineTokens(token.tokens) : [textNode(token.text)]),
        )
        break

      case 'paragraph': {
        // Check for standalone images
        if (token.tokens && token.tokens.length === 1 && token.tokens[0].type === 'image') {
          const img = token.tokens[0]
          const mediaId = imageMap[img.href]
          if (mediaId) {
            children.push(uploadNode(mediaId))
          }
        } else {
          children.push(
            paragraphNode(token.tokens ? parseInlineTokens(token.tokens) : [textNode(token.text)]),
          )
        }
        break
      }

      case 'list':
        children.push(processListItems(token.items, token.ordered))
        break

      case 'blockquote':
        children.push(
          quoteNode(
            token.tokens
              ? token.tokens.flatMap((t) => {
                  if ('tokens' in t && t.tokens) {
                    return [paragraphNode(parseInlineTokens(t.tokens))]
                  }
                  if ('text' in t) {
                    return [paragraphNode([textNode(t.text as string)])]
                  }
                  return []
                })
              : [paragraphNode([textNode(token.text)])],
          ),
        )
        break

      case 'code':
        children.push(codeBlockNode(token.text, token.lang || 'plaintext'))
        break

      case 'hr':
        children.push(horizontalRuleNode())
        break

      case 'space':
        // Ignore whitespace tokens
        break

      default:
        if ('text' in token && typeof token.text === 'string') {
          children.push(paragraphNode([textNode(token.text)]))
        }
    }
  }

  return {
    root: {
      type: 'root',
      version: 1,
      children,
      direction: null,
      format: '',
      indent: 0,
    },
  }
}
