from markdown_pdf import MarkdownPdf, Section

if __name__ == "__main__":
    pdf = MarkdownPdf(toc_level=2)
    with open("../PROJECT_OVERVIEW.md", "r", encoding="utf-8") as f:
        content = f.read()
    pdf.add_section(Section(content))
    pdf.save("../PROJECT_OVERVIEW.pdf")
    print("PDF successfully generated.")
