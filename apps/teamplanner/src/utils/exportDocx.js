import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx'

const FONT = 'Arial'
const SIZE = 24 // 12pt = 24 half-points

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const BORDER_STYLE = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }

function txt(text, bold = false) {
  return new TextRun({ text, font: FONT, size: SIZE, bold })
}

function cell(content, bold = false) {
  return new TableCell({
    borders: BORDER_STYLE,
    children: [
      new Paragraph({ children: [txt(content, bold)] }),
    ],
  })
}

function buildTeamSection(team, players) {
  const teamPlayers = team.playerIds
    .map(id => players.find(p => p.id === id))
    .filter(Boolean)

  const heren = teamPlayers.filter(p => p.gender !== 'f').map(p => p.name)
  const dames = teamPlayers.filter(p => p.gender === 'f').map(p => p.name)
  const maxRows = Math.max(heren.length, dames.length)

  const headerRow = new TableRow({
    children: [cell('Heren', true), cell('Dames', true)],
  })

  const dataRows = Array.from({ length: maxRows }, (_, i) =>
    new TableRow({
      children: [
        cell(heren[i] ?? ''),
        cell(dames[i] ?? ''),
      ],
    })
  )

  return [
    new Paragraph({
      text: team.name,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 120 },
    }),
    new Paragraph({
      children: [txt(`${heren.length} heren, ${dames.length} dames`)],
      spacing: { after: 160 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    }),
    new Paragraph({ text: '', spacing: { after: 240 } }),
  ]
}

function sectionHeading(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 200 },
  })
}

export async function exportDocx(state) {
  const { players, teams } = state

  const senioren = teams.filter(t => t.type === 'senioren')
  const jeugd = teams.filter(t => t.type === 'jeugd')

  const children = [
    ...(senioren.length > 0 ? [sectionHeading('Seniorenindeling'), ...senioren.flatMap(t => buildTeamSection(t, players))] : []),
    ...(jeugd.length > 0 ? [sectionHeading('Jeugdindeling'), ...jeugd.flatMap(t => buildTeamSection(t, players))] : []),
  ]

  const doc = new Document({
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'teamindeling.docx'
  a.click()
  URL.revokeObjectURL(url)
}
