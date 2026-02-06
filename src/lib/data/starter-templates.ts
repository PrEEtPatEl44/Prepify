export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "classic",
    name: "Classic Resume",
    description: "A clean, traditional resume layout with clear sections and professional formatting.",
    content: `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{6pt}

\\begin{document}

\\begin{center}
  {\\LARGE\\bfseries {{FULL_NAME}}}\\\\[4pt]
  {{LOCATION}} \\quad | \\quad {{EMAIL}} \\quad | \\quad {{PHONE}}
\\end{center}

\\section{Education}
\\textbf{{{SCHOOL}}} \\hfill {{GRADUATION_DATE}}\\\\
{{DEGREE}} in {{FIELD}}

\\section{Experience}
\\textbf{{{TITLE}}} \\hfill {{START_DATE}} -- {{END_DATE}}\\\\
\\textit{{{COMPANY}}}
\\begin{itemize}[leftmargin=*, nosep]
  \\item {{DESCRIPTION}}
\\end{itemize}

\\section{Skills}
{{SKILLS}}

\\end{document}`,
  },
  {
    id: "modern",
    name: "Modern Resume",
    description: "A contemporary design with a bold header and compact layout for maximum impact.",
    content: `\\documentclass[11pt,a4paper]{article}
\\usepackage[top=0.5in,bottom=0.5in,left=0.6in,right=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}
\\usepackage[hidelinks]{hyperref}

\\definecolor{accent}{RGB}{37,99,235}
\\pagestyle{empty}
\\titleformat{\\section}{\\color{accent}\\large\\bfseries}{}{0em}{}[{\\color{accent}\\titlerule[0.8pt]}]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

\\begin{document}

\\begin{center}
  {\\Huge\\bfseries {{FULL_NAME}}}\\\\[6pt]
  {\\small {{LOCATION}} \\quad $\\cdot$ \\quad {{EMAIL}} \\quad $\\cdot$ \\quad {{PHONE}}}
\\end{center}

\\section{Education}
\\textbf{{{DEGREE}} in {{FIELD}}} \\hfill {\\small {{GRADUATION_DATE}}}\\\\
{{SCHOOL}}

\\section{Professional Experience}
\\textbf{{{TITLE}}} --- {{COMPANY}} \\hfill {\\small {{START_DATE}} -- {{END_DATE}}}
\\begin{itemize}[leftmargin=12pt, nosep, topsep=3pt]
  \\item {{DESCRIPTION}}
\\end{itemize}

\\section{Technical Skills}
{{SKILLS}}

\\end{document}`,
  },
  {
    id: "minimal",
    name: "Minimal Resume",
    description: "A minimalist single-column layout that lets your content speak for itself.",
    content: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\newcommand{\\sectionline}{\\vspace{4pt}\\hrule\\vspace{8pt}}

\\begin{document}

{\\Large\\bfseries {{FULL_NAME}}}\\\\[2pt]
{{EMAIL}} \\quad | \\quad {{PHONE}} \\quad | \\quad {{LOCATION}}

\\sectionline

{\\bfseries EDUCATION}\\\\[4pt]
{{SCHOOL}}\\\\
{{DEGREE}} in {{FIELD}} \\hfill {{GRADUATION_DATE}}

\\sectionline

{\\bfseries EXPERIENCE}\\\\[4pt]
{\\bfseries {{TITLE}}}, {{COMPANY}} \\hfill {{START_DATE}} -- {{END_DATE}}
\\begin{itemize}[leftmargin=*, nosep, topsep=2pt]
  \\item {{DESCRIPTION}}
\\end{itemize}

\\sectionline

{\\bfseries SKILLS}\\\\[4pt]
{{SKILLS}}

\\end{document}`,
  },
];
