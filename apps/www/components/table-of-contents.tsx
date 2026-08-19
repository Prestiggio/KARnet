import GithubSlugger from "github-slugger"

type TocNode = {
  depth: number
  value: string
  children: TocNode[]
}

type LinkedNode = {
  id: string
  value: string
  depth: number
  children: LinkedNode[]
}

// Headings can embed `{props.data.KEY}` expressions (e.g. legal boilerplate). The
// mdx toc export captures those as raw, unevaluated expression source (no braces),
// so the placeholder is resolved here against the same `data` object passed to the mdx.
function resolvePlaceholders(value: string, data: any): string {
  return value.replace(/props\.data\.([A-Za-z0-9_]+)/g, (_, key) => String(data?.[key] ?? ''))
}

// Slugs are recomputed here (rather than read from the mdx `toc` export) with the
// same github-slugger instance/order rehype-slug uses on the actual headings, so the
// generated hrefs are guaranteed to match the heading ids rendered in the article.
// Placeholders are resolved before slugging so ids match the rendered (resolved) heading text.
function linkify(nodes: TocNode[], slugger: GithubSlugger, data: any): LinkedNode[] {
  return nodes.map((node) => {
    const value = resolvePlaceholders(node.value, data)
    return {
      id: slugger.slug(value),
      value,
      depth: node.depth,
      children: linkify(node.children ?? [], slugger, data),
    }
  })
}

function TocList({ items }: { items: LinkedNode[] }) {
  if (items.length === 0) return null

  return (
    <ul className="space-y-2 mx-0">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className="text-foreground/70 hover:text-foreground">
            {item.value}
          </a>
          {item.children.length > 0 && (
            <div className="mt-2 ml-3 border-l border-foreground/15 pl-3">
              <TocList items={item.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export function TableOfContents({ data, toc }: { data: any, toc: TocNode[] }) {
  const slugger = new GithubSlugger()
  const linked = linkify(toc, slugger, data)

  // Skip the page's own h1 and start the list from the sections under it.
  const items = linked.length === 1 && linked[0].depth === 1 ? linked[0].children : linked

  if (items.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <TocList items={items} />
    </nav>
  )
}
