"""Render the FlowCV-style CV from a content dict to HTML, then print it to PDF with Chrome.

    python3 scripts/cv/build.py new /tmp/cv.html
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
        --virtual-time-budget=8000 --print-to-pdf=public/mostafa-osama-cv.pdf file:///tmp/cv.html

Edit the NEW dict below. Keep it to one page: check the PDF has a single page before committing.
`original` re-renders the FlowCV export's own text; it is only for checking layout fidelity.
Every measurement below is in pt and comes from the FlowCV export (measured with pdfminer).
"""
import html
import sys

E = html.escape

ICON = (
    # FlowCV's external-link mark: a 5.39pt open box plus an arrow that overshoots its top-right corner.
    '<svg class="ext" viewBox="0 0 6.22 6.22" aria-hidden="true">'
    '<path d="M2.4 0.83H0.3V5.92H5.09V3.6" fill="none" stroke="currentColor" stroke-width="0.6"/>'
    '<path d="M3.2 0.3H5.92V3.02M5.92 0.3 2.7 3.52" fill="none" stroke="currentColor" stroke-width="0.6"/>'
    "</svg>"
)

CSS = """
@page { size: 594.96pt 841.92pt; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "PT Serif", serif; font-size: 11.5pt; line-height: 13.5pt; color: #000;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  font-variant-ligatures: no-common-ligatures;
}
a { color: inherit; text-decoration: none; }
.page { padding: __TOP__pt 0 0 34pt; width: 595pt; }
.inner { width: 527.25pt; }

.head { display: flex; align-items: baseline; margin: 0; }
.name { font-weight: 700; font-size: 22.5pt; line-height: 27pt; }
.title { font-style: italic; font-size: 16.5pt; line-height: 27pt; margin-left: __TITLEGAP__pt; }
.contact { display: grid; row-gap: 9.75pt; margin-top: __CONTACTTOP__pt; margin-bottom: __CONTACTBOTTOM__pt; }
.contact .line { display: flex; column-gap: 8.04pt; }
.contact .sep { margin-left: 0.19pt; }

h2 { margin: __SECTIONTOP__pt 0 0; font-size: 14.5pt; line-height: 17pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.375pt;
     padding-bottom: __RULEPAD__pt; border-bottom: 0.75pt solid #000; }
.sec-body { padding-top: __BODYPAD__pt; }
.sec-body.text { padding-top: 6.75pt; }
.sec-body.skills { padding-top: 8.25pt; }

ul { list-style: none; margin: 0; padding: 0 0 0 10.35pt; }
li { position: relative; }
li::before { content: ""; position: absolute; left: -9.1pt; top: __DOTTOP__pt; width: 3pt; height: 3pt; border-radius: 50%; background: #000; }

.entry + .entry { margin-top: 9pt; }
.row { display: flex; justify-content: space-between; gap: 12pt; }
.row b { font-weight: 700; }
.row i { font-style: italic; }
.desc { width: 75%; }
.ext { width: 6.22pt; height: 6.22pt; margin-left: 4.26pt; vertical-align: __ICONVA__pt; color: #1a1a1a; }
.label { font-weight: 700; }
.inl u { text-decoration: underline; text-decoration-thickness: 0.75pt; text-underline-offset: 1.1pt; }
"""

TUNE = {
    "TOP": "30.75",
    "TITLEGAP": "12.17",
    "CONTACTTOP": "6.0",
    "SECTIONTOP": "15.75",
    "RULEPAD": "0",
    "BODYPAD": "7.5",
    "DOTTOP": "6.2",
    "ICONVA": "-0.6",
    "CONTACTBOTTOM": "21.75",
}


def inline(text, href):
    return f'<a class="inl" href="{E(href)}"><u>{E(text)}</u>{ICON}</a>'


def bullets(items):
    return "<ul>" + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


def render(c):
    css = CSS
    for k, v in TUNE.items():
        css = css.replace("__" + k + "__pt", v + "pt")
    def line(items):
        parts = []
        for i, (text, href) in enumerate(items):
            if i:
                parts.append('<span class="sep">|</span>')
            parts.append(f'<a href="{E(href)}">{E(text)}</a>' if href != "#" else f"<span>{E(text)}</span>")
        return '<div class="line">' + "".join(parts) + "</div>"
    contact = "".join(line(l) for l in c["contact"])
    out = [
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">",
        f"<title>{E(c['doc_title'])}</title>",
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&display=block">',
        f"<style>{css}</style></head><body><div class=\"page\"><div class=\"inner\">",
        f'<p class="head"><span class="name">{E(c["name"])}</span><span class="title">{E(c["title"])}</span></p>',
        f'<div class="contact">{contact}</div>',
    ]
    for sec in c["sections"]:
        out.append(f"<h2>{E(sec['heading'])}</h2><div class=\"sec-body {sec['kind']}\">")
        kind = sec["kind"]
        if kind == "text":
            out.append(f"<div>{sec['html']}</div>")
        elif kind == "skills":
            if sec.get("group"):
                out.append(f'<div class="label">{E(sec["group"])}</div>')
            out.append(bullets([f'<span class="label">{E(k)}:</span> {E(v)}' for k, v in sec["items"]]))
        elif kind in ("experience", "education"):
            for e in sec["entries"]:
                link = f'<a href="{E(e["href"])}">{E(e["sub"])}{ICON}</a>' if e.get("href") else E(e["sub"])
                out.append('<div class="entry">')
                out.append(f'<div class="row"><b>{E(e["title"])}</b><span>{E(e["date"])}</span></div>')
                if e.get("sub") or e.get("place"):
                    out.append(f'<div class="row"><i>{link}</i><span>{E(e.get("place", ""))}</span></div>')
                if e.get("bullets"):
                    out.append(f'<div class="desc">{bullets(e["bullets"])}</div>')
                if e.get("text"):
                    out.append(f'<div class="desc">{e["text"]}</div>')
                out.append("</div>")
        elif kind == "projects":
            for p in sec["entries"]:
                t = f'<a href="{E(p["href"])}">{E(p["title"])}{ICON}</a>' if p.get("href") else E(p["title"])
                out.append(f'<div class="entry"><div class="row"><b>{t}</b></div>{bullets(p["bullets"])}</div>')
        out.append("</div>")
    out.append("</div></div></body></html>")
    return "".join(out)


CONTACT = [
    ("mostafa.osama.dev@gmail.com", "mailto:mostafa.osama.dev@gmail.com"),
    ("GitHub", "https://github.com/TheMostafaOsamaDev"),
    ("LinkedIn", "https://www.linkedin.com/in/mostafa-osama-a5b042239/"),
    ("+201099865475", "tel:+201099865475"),
    ("Cairo, Egypt", None),
    ("WhatsApp", "https://wa.me/+201099865475"),
]

ORIGINAL = {
    "doc_title": "Mostafa Osama Mohamed Resume",
    "name": "Mostafa Osama Mohamed",
    "title": "Full stack developer",
    "contact": [[(t, h or "#") for t, h in CONTACT[:5]], [(t, h or "#") for t, h in CONTACT[5:]]],
    "sections": [
        {"heading": "Profile", "kind": "text", "html": "I'm a Full Stack Developer skilled in React, Next.js, Redux, Node.js, NestJS, and Express.js, with expertise in MongoDB, MySQL, GraphQL, and RESTful APIs. I build responsive, scalable web applications, optimizing performance and maintainability, as shown in projects like CarePulse and Feather Blog. I use Jira for efficient project management. I hold a Bachelor’s in Computer Science from Beni Suef University (2024, GPA 3.1, A+ project)."},
        {"heading": "Skills", "kind": "skills", "group": "Skills", "items": [
            ("Frontend", "React.js, Next.js, Redux, Redux Toolkit, TanstackQuery"),
            ("Backend", "Node.js, NestJS, Express.js"),
            ("Databases", "MongoDB, MySQL"),
            ("APIs", "GraphQL, RESTful APIs"),
            ("Other", "Jira"),
        ]},
        {"heading": "Professional Experience", "kind": "experience", "entries": [
            {"title": "Full Stack Developer", "date": "08/2024 – present", "sub": "Onvaca – Travel Booking Platform", "href": "https://onvaca.com/", "bullets": [
                "Developed and maintained full-stack features using Next.js and Redux, delivering responsive and performant web interfaces.",
                "Refactored and optimized frontend and backend code, improving maintainability and scalability across the platform.",
                "&nbsp;",
            ]},
            {"title": "Freelance Web Developer", "date": "2022 – 2024", "sub": "", "bullets": [
                "Designed and developed scalable backend architectures for diverse clients.",
                "Built and optimized RESTful and GraphQL APIs with a focus on performance and security.",
                "Integrated databases like MongoDB and MySQL for efficient data management.",
                "Delivered full-stack applications using React, Next.js, and Redux",
            ]},
        ]},
        {"heading": "Education", "kind": "education", "entries": [
            {"title": "Bachelor of Computer Science", "date": "2020 – 2024", "sub": "Beni Suef University", "place": "Beni Suef, Egypt",
             "text": "Holds a degree in Computer Science from the Faculty of CS and AI with a GPA of 3.1, and a gradution project with A+."},
        ]},
    ],
}

NEW = {
    "doc_title": "Mostafa Osama Mohamed, Full Stack Developer",
    "name": "Mostafa Osama Mohamed",
    "title": "Full stack developer",
    "contact": [[(t, h or "#") for t, h in CONTACT[:5]], [(t, h or "#") for t, h in CONTACT[5:]]],
    "sections": [
        {"heading": "Profile", "kind": "text", "html": "Full stack developer at Onvaca, a vacation-rental marketplace, working on a Node.js and GraphQL backend (MySQL, Redis, AWS) and a Next.js frontend. I have merged 850+ pull requests there, two thirds of them backend work on payments, reservations and pricing. I also build Riwaq, an open-source e-book reader with 1,150+ downloads."},
        {"heading": "Skills", "kind": "skills", "items": [
            ("Frontend", "React, Next.js, Redux, TanStack Query, Tailwind CSS, Tauri"),
            ("Backend", "Node.js, Express, NestJS, GraphQL, REST, Socket.IO"),
            ("Data", "MySQL, PostgreSQL, MongoDB, Redis, BullMQ"),
            ("Cloud and payments", "AWS (S3, CloudWatch), Stripe, Paymob"),
            ("Tools", "Git, Jest, Sentry, Jira"),
        ]},
        {"heading": "Professional Experience", "kind": "experience", "entries": [
            {"title": "Full Stack Developer", "date": "08/2024 – present", "sub": "Onvaca – Travel Booking Platform", "href": "https://onvaca.com/", "bullets": [
                "Implemented refunds, payouts and multi-currency logic across Stripe and Paymob, including FX snapshots and processor-fee accounting.",
                "Built reservation pricing and the Split &amp; Share group-booking flow: shared payments, seat cancellations and refunds.",
                "Fixed GraphQL performance issues by batching listing loaders and resolving queries in parallel.",
                "Moved frontend code out of the API server, separating the backend from the original monolith.",
                "Shipped 300+ frontend and admin pull requests in Next.js and Redux.",
            ]},
            {"title": "Freelance Web Developer", "date": "2022 – 2024", "sub": "", "bullets": [
                "Built REST and GraphQL APIs on MongoDB and MySQL for clients.",
                "Delivered full-stack applications with React, Next.js and Redux.",
            ]},
        ]},
        {"heading": "Education", "kind": "education", "entries": [
            {"title": "Bachelor of Computer Science", "date": "2020 – 2024", "sub": "Beni Suef University", "place": "Beni Suef, Egypt",
             "text": "Faculty of CS and AI. GPA 3.1, graduation project graded A+."},
        ]},
        {"heading": "Projects", "kind": "projects", "entries": [
            {"title": "Riwaq (Creator)", "href": "https://github.com/TheMostafaOsamaDev/Riwaq-Reader", "bullets": [
                "Offline-first e-book reader for EPUB, PDF and Word on desktop and Android: Tauri, Rust, React.",
                "9 releases, 1,150+ downloads. Extensions reach the network only through an injected host API.",
            ]},
            {"title": "Feather Blog (Full-Stack Developer)", "bullets": [
                f'Blogging platform with a {inline("NestJS backend", "https://github.com/TheMostafaOsamaDev/nestjs-feather-blog")} and a {inline("Next.js 14 frontend", "https://github.com/TheMostafaOsamaDev/nextjs-feather-blog")}, documented with Swagger.',
                "Threaded comments, likes, drafts, tag search, a trending feed, Google OAuth and avatar resizing.",
            ]},
            {"title": "Chat Universe (Full-Stack Developer)", "href": "https://github.com/TheMostafaOsamaDev/chat-universe", "bullets": [
                "Real-time chat with presence: a NestJS gateway over Socket.IO, MongoDB, and Passport JWT auth.",
            ]},
        ]},
    ],
}

if __name__ == "__main__":
    which, out = sys.argv[1], sys.argv[2]
    open(out, "w").write(render(ORIGINAL if which == "original" else NEW))
