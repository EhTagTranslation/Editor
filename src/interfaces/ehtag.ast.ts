
export type Tree = ParaNode[];

export type NodeType = 'paragraph' | 'text' | 'br' | 'code' | 'image' | 'link' | 'emphasis' | 'strong';
export interface Node {
  type: NodeType;
}
export interface ContainerNode extends Node {
  content: InlineNode[];
}
export interface InlineNode extends Node {
  type: Exclude<NodeType, 'paragraph'>;
}

export interface ParaNode extends ContainerNode {
  type: 'paragraph';
}
export interface LeafNode extends InlineNode {
  type: 'text' | 'code' | 'br';
}
export interface TextLeafNode extends LeafNode {
  type: 'text' | 'code';
  text: string;
}
export interface TextNode extends TextLeafNode {
  type: 'text';
}
export interface CodeNode extends TextLeafNode {
  type: 'code';
}
export interface BreakNode extends LeafNode {
  type: 'br';
}
export interface StylingNode extends InlineNode, ContainerNode {
  type: 'emphasis' | 'strong';
}
export interface EmphasisNode extends StylingNode {
  type: 'emphasis';
}
export interface StrongNode extends StylingNode {
  type: 'strong';
}
export interface MediaNode extends InlineNode, ContainerNode {
  type: 'link' | 'image';
  title: string;
  url: string;
}
export interface LinkNode extends MediaNode {
  type: 'link';
}
export interface ImageNode extends MediaNode {
  type: 'image';
  nsfw: false | 'R18' | 'R18G';
}
