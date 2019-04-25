
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
  text: string;
}
export interface TextNode extends LeafNode {
  type: 'text';
}
export interface CodeNode extends LeafNode {
  type: 'code';
}
export interface BreakNode extends InlineNode {
  type: 'br';
}
export interface EmphasisNode extends InlineNode, ContainerNode {
  type: 'emphasis';
}
export interface StrongNode extends InlineNode, ContainerNode {
  type: 'strong';
}
export interface MediaNode extends ContainerNode, InlineNode {
  type: 'link' | 'image';
  title: string;
  url: string;
}
export interface LinkNode extends MediaNode {
  type: 'link';
}
export interface ImageNode extends MediaNode {
  type: 'image';
  nsfw: boolean;
}
