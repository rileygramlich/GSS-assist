"""
Scope a stylesheet under a wrapper class so two design systems can share a page
without colliding.

Both products define .btn, .eyebrow, .section-head and @keyframes pop. Rather
than rewrite every className in twenty components (and every template-string
className with it), we prefix the selectors and rename the keyframes. The JSX
is untouched, both designs survive byte-for-byte, and --accent becomes a single
token swap per route.

Handled: nested at-rules (@media/@supports), :root, html/body/*, keyframe
renaming plus their `animation`/`animation-name` references, and @import/@font-face
which must stay at the top level and unprefixed.
"""
import re
import sys


def split_blocks(css):
    """Yield (prelude, body, is_block) walking one brace level at a time."""
    out, depth, buf, start = [], 0, "", 0
    i = 0
    while i < len(css):
        c = css[i]
        if c == "{":
            if depth == 0:
                prelude = css[start:i]
                body_start = i + 1
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                out.append((prelude, css[body_start:i]))
                start = i + 1
        i += 1
    tail = css[start:]
    return out, tail


AT_PASSTHROUGH = ("@import", "@font-face", "@charset", "@namespace")
AT_NESTED = ("@media", "@supports", "@container", "@layer")


def prefix_selector(sel, wrapper):
    sel = sel.strip()
    if not sel:
        return sel
    parts = []
    for one in sel.split(","):
        s = one.strip()
        if not s:
            continue
        if s == ":root":
            parts.append(wrapper)
        elif s in ("html", "body"):
            # Page-level rules would fight between the two products; the wrapper
            # element takes them instead.
            parts.append(wrapper)
        elif s == "*":
            parts.append(f"{wrapper} *")
        elif s.startswith("@"):
            parts.append(s)
        else:
            parts.append(f"{wrapper} {s}")
    return ", ".join(parts)


# Statement at-rules end in a semicolon rather than a block. Left inline they
# get swallowed into the prelude of whatever rule follows them, which silently
# stops that rule from being prefixed.
# The terminator is the first semicolon OUTSIDE quotes and parens. Google Fonts
# URLs carry semicolons inside them (`wght@400;500;600`), so a naive [^;]* stops
# mid-URL and leaves the remainder to be parsed as a selector.
STATEMENT_AT = re.compile(
    r"""@(?:import|charset|namespace)\b
        (?: [^;'"()]        # ordinary text
          | url\([^)]*\)     # url(...) with anything inside
          | "[^"]*"         # double-quoted string
          | '[^']*'         # single-quoted string
        )*
        ;""",
    re.I | re.X,
)


def scope(css, wrapper, kf_prefix):
    hoisted = STATEMENT_AT.findall(css)
    css = STATEMENT_AT.sub("", css)

    # Collect keyframe names first so references can be rewritten everywhere.
    kf_names = set(re.findall(r"@keyframes\s+([A-Za-z_][\w-]*)", css))

    def walk(text, top=True):
        blocks, tail = split_blocks(text)
        pieces = []
        for prelude, body in blocks:
            # Leading comments must come off BEFORE deciding what kind of rule
            # this is. A documented `@media` whose prelude still carries its
            # comment does not look like an at-rule, and its whole body then
            # escapes scoping in silence.
            lead = ""
            m = re.match(r"^(\s*(?:/\*.*?\*/\s*)*)", prelude, re.S)
            if m:
                lead, prelude = m.group(1), prelude[m.end():]
            p = prelude.strip()

            if p.startswith("@keyframes"):
                name = re.match(r"@keyframes\s+([A-Za-z_][\w-]*)", p).group(1)
                pieces.append(f"{lead}@keyframes {kf_prefix}-{name} {{{body}}}")
            elif p.startswith(AT_NESTED):
                pieces.append(f"{lead}{p} {{\n{walk(body, top=False)}}}")
            elif p.startswith(AT_PASSTHROUGH):
                pieces.append(f"{lead}{p} {{{body}}}")
            else:
                pieces.append(f"{lead}{prefix_selector(p, wrapper)} {{{body}}}")
        return "\n".join(pieces) + (tail if tail.strip() else "\n")

    out = walk(css)

    # Rewrite animation references to the renamed keyframes.
    for name in kf_names:
        out = re.sub(
            r"(animation(?:-name)?\s*:[^;}]*?)\b" + re.escape(name) + r"\b",
            lambda m: m.group(1) + f"{kf_prefix}-{name}",
            out,
        )

    # @import must be the first thing in the sheet to be honoured at all.
    return ("\n".join(hoisted) + "\n" if hoisted else "") + out


if __name__ == "__main__":
    path, wrapper, kf = sys.argv[1], sys.argv[2], sys.argv[3]
    src = open(path).read()
    open(path, "w").write(scope(src, wrapper, kf))
    print(f"  scoped {path} -> {wrapper}")
