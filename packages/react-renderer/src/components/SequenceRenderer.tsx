import type { Participant, SequenceDiagram } from '@lyric-js/core';
import type React from 'react';
import type { Theme } from '../themes/types';

interface SequenceRendererProps {
  diagram: SequenceDiagram;
  theme: Theme;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const SequenceRenderer: React.FC<SequenceRendererProps> = ({
  diagram,
  theme,
  width = 800,
  height = 600,
}) => {
  const statements = diagram.statements || [];

  interface MessageType {
    from: string;
    to: string;
    message: string;
    arrowType?: string;
  }

  // Extract participants and messages recursively from statements
  const participantsMap = new Map<string, Participant>();
  const messages: MessageType[] = [];

  const extractMessagesRecursively = (stmts: typeof statements) => {
    for (const stmt of stmts) {
      if (stmt.type === 'message') {
        if (!participantsMap.has(stmt.from)) {
          participantsMap.set(stmt.from, { type: 'participant', id: stmt.from });
        }
        if (!participantsMap.has(stmt.to)) {
          participantsMap.set(stmt.to, { type: 'participant', id: stmt.to });
        }
        messages.push({
          from: stmt.from,
          to: stmt.to,
          message: stmt.text || '',
          arrowType: stmt.arrowType,
        });
      } else if (
        stmt.type === 'loop' ||
        stmt.type === 'alt' ||
        stmt.type === 'opt' ||
        stmt.type === 'par' ||
        stmt.type === 'critical' ||
        stmt.type === 'break' ||
        stmt.type === 'rect'
      ) {
        // Recursively extract messages from nested blocks
        if ('statements' in stmt && Array.isArray(stmt.statements)) {
          extractMessagesRecursively(stmt.statements);
        }
        // Handle elseBlocks, andBlocks, optionBlocks
        if ('elseBlocks' in stmt && Array.isArray(stmt.elseBlocks)) {
          for (const block of stmt.elseBlocks) {
            if (Array.isArray(block.statements)) {
              extractMessagesRecursively(block.statements);
            }
          }
        }
        if ('andBlocks' in stmt && Array.isArray(stmt.andBlocks)) {
          for (const block of stmt.andBlocks) {
            if (Array.isArray(block.statements)) {
              extractMessagesRecursively(block.statements);
            }
          }
        }
        if ('optionBlocks' in stmt && Array.isArray(stmt.optionBlocks)) {
          for (const block of stmt.optionBlocks) {
            if (Array.isArray(block.statements)) {
              extractMessagesRecursively(block.statements);
            }
          }
        }
      }
    }
  };

  extractMessagesRecursively(statements);

  const participants = Array.from(participantsMap.values());

  const participantWidth = 120;
  const participantHeight = 40;
  const participantSpacing = 60;
  const messageSpacing = 60;
  const topMargin = 50;
  const leftMargin = 50;

  const totalWidth =
    width || participants.length * (participantWidth + participantSpacing) + leftMargin * 2;
  const totalHeight =
    height || messages.length * messageSpacing + topMargin + participantHeight + 100;

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      {participants.map((participant: Participant, index: number) => {
        const x = leftMargin + index * (participantWidth + participantSpacing);
        const y = topMargin;

        return (
          <g key={participant.id || index}>
            <rect
              x={x}
              y={y}
              width={participantWidth}
              height={participantHeight}
              fill={theme.colors.node.fill}
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={5}
            />
            <text
              x={x + participantWidth / 2}
              y={y + participantHeight / 2}
              fill={theme.colors.text}
              fontSize={14}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {participant.alias || participant.id}
            </text>
            <line
              x1={x + participantWidth / 2}
              y1={y + participantHeight}
              x2={x + participantWidth / 2}
              y2={totalHeight - 50}
              stroke={theme.colors.node.stroke}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          </g>
        );
      })}

      {messages.map((message: MessageType, index: number) => {
        const fromIndex = participants.findIndex((p: Participant) => p.id === message.from);
        const toIndex = participants.findIndex((p: Participant) => p.id === message.to);

        if (fromIndex === -1 || toIndex === -1) return null;

        const x1 =
          leftMargin + fromIndex * (participantWidth + participantSpacing) + participantWidth / 2;
        const x2 =
          leftMargin + toIndex * (participantWidth + participantSpacing) + participantWidth / 2;
        const y = topMargin + participantHeight + (index + 1) * messageSpacing;

        return (
          <g key={index}>
            <line
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke={theme.colors.edge.stroke}
              strokeWidth={2}
              markerEnd="url(#arrowhead)"
            />
            <text
              x={(x1 + x2) / 2}
              y={y - 5}
              fill={theme.colors.text}
              fontSize={12}
              textAnchor="middle"
            >
              {message.message}
            </text>
          </g>
        );
      })}

      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill={theme.colors.edge.stroke} />
        </marker>
      </defs>
    </svg>
  );
};
