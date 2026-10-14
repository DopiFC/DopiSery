/**
 * Service to generate real Microsoft Word (.docx) files client-side using 'docx' library.
 * Preserves headings, paragraphs, bold, italic, underline, alignments, lists, tables, and page breaks.
 */
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
  PageBreak,
} from 'docx';

interface TextFormat {
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  size?: number;
}

function parseInlineNodes(node: Node, currentFormat: TextFormat = {}): TextRun[] {
  const runs: TextRun[] = [];

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];

    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || '';
      if (text.length > 0) {
        runs.push(
          new TextRun({
            text: text,
            bold: currentFormat.bold,
            italics: currentFormat.italics,
            underline: currentFormat.underline ? {} : undefined,
            strike: currentFormat.strike,
            color: currentFormat.color,
            size: currentFormat.size ? currentFormat.size * 2 : 24, // half-points in docx (12pt = 24)
          })
        );
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      const newFormat: TextFormat = { ...currentFormat };

      if (tagName === 'strong' || tagName === 'b') newFormat.bold = true;
      if (tagName === 'em' || tagName === 'i') newFormat.italics = true;
      if (tagName === 'u') newFormat.underline = true;
      if (tagName === 's' || tagName === 'strike') newFormat.strike = true;

      // Check inline styles
      if (el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight || '0') >= 600) {
        newFormat.bold = true;
      }
      if (el.style.fontStyle === 'italic') {
        newFormat.italics = true;
      }
      if (el.style.textDecoration && el.style.textDecoration.includes('underline')) {
        newFormat.underline = true;
      }
      if (el.style.color && el.style.color.startsWith('#')) {
        newFormat.color = el.style.color.replace('#', '');
      }
      if (el.style.fontSize) {
        const pt = parseInt(el.style.fontSize);
        if (!isNaN(pt) && pt > 0) newFormat.size = pt;
      }

      if (tagName === 'br') {
        runs.push(new TextRun({ text: '', break: 1 }));
      } else {
        runs.push(...parseInlineNodes(el, newFormat));
      }
    }
  }

  return runs;
}

function getAlignment(el: HTMLElement): (typeof AlignmentType)[keyof typeof AlignmentType] {
  const alignStyle = el.style.textAlign || el.getAttribute('align') || '';
  if (alignStyle === 'center' || el.classList.contains('text-center')) {
    return AlignmentType.CENTER;
  }
  if (alignStyle === 'right' || el.classList.contains('text-right')) {
    return AlignmentType.RIGHT;
  }
  if (alignStyle === 'justify' || el.classList.contains('text-justify')) {
    return AlignmentType.JUSTIFIED;
  }
  return AlignmentType.LEFT;
}

/**
 * Converts an HTML string or element from the editor into DOCX paragraphs and tables.
 */
export async function exportHtmlToDocxBlob(
  htmlContent: string,
  docTitle = 'Tài liệu DopiSery'
): Promise<Blob> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
  const container = doc.body.firstElementChild || doc.body;

  const docChildren: (Paragraph | Table)[] = [];

  for (let i = 0; i < container.childNodes.length; i++) {
    const node = container.childNodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').trim();
      if (text) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text, size: 24 })],
            spacing: { after: 120 },
          })
        );
      }
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // Check for page break marker
    if (el.classList.contains('page-break') || tagName === 'hr') {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
      continue;
    }

    // Headings
    if (tagName === 'h1') {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: getAlignment(el),
          children: parseInlineNodes(el),
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (tagName === 'h2') {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          alignment: getAlignment(el),
          children: parseInlineNodes(el),
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (tagName === 'h3') {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          alignment: getAlignment(el),
          children: parseInlineNodes(el),
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (tagName === 'table') {
      // Table handling
      const rows: TableRow[] = [];
      const trElements = el.querySelectorAll('tr');

      trElements.forEach((tr) => {
        const cells: TableCell[] = [];
        const tdElements = tr.querySelectorAll('th, td');

        tdElements.forEach((td) => {
          const isHeader = td.tagName.toLowerCase() === 'th';
          const cellParagraphs: Paragraph[] = [
            new Paragraph({
              alignment: getAlignment(td as HTMLElement),
              children: parseInlineNodes(td, { bold: isHeader }),
            }),
          ];

          cells.push(
            new TableCell({
              children: cellParagraphs,
              width: { size: 100 / Math.max(1, tdElements.length), type: WidthType.PERCENTAGE },
              shading: isHeader ? { fill: 'F3F4F6' } : undefined,
              margins: {
                top: 100,
                bottom: 100,
                left: 140,
                right: 140,
              },
            })
          );
        });

        if (cells.length > 0) {
          rows.push(new TableRow({ children: cells }));
        }
      });

      if (rows.length > 0) {
        docChildren.push(
          new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            },
          })
        );
        // Add spacing after table
        docChildren.push(new Paragraph({ spacing: { after: 140 } }));
      }
    } else if (tagName === 'ul') {
      const lis = el.querySelectorAll(':scope > li');
      lis.forEach((li) => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            children: parseInlineNodes(li),
            spacing: { after: 80 },
          })
        );
      });
    } else if (tagName === 'ol') {
      let num = 1;
      const lis = el.querySelectorAll(':scope > li');
      lis.forEach((li) => {
        const runs = parseInlineNodes(li);
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: `${num++}. `, bold: true }), ...runs],
            spacing: { after: 80 },
          })
        );
      });
    } else {
      // Standard paragraph
      const runs = parseInlineNodes(el);
      if (runs.length > 0) {
        docChildren.push(
          new Paragraph({
            alignment: getAlignment(el),
            children: runs,
            spacing: { after: 120, line: 276 }, // 1.15 line height
          })
        );
      }
    }
  }

  // Ensure at least one paragraph exists
  if (docChildren.length === 0) {
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: 'Tài liệu trống', size: 24 })],
      })
    );
  }

  const wordDoc = new Document({
    title: docTitle,
    creator: 'DopiSery Smart Document Tools',
    description: 'Chuyển đổi an toàn trên trình duyệt bởi DopiSery',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(wordDoc);
}
