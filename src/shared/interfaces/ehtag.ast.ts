export type Tree = ParaNode[];

export const NodeType = ['paragraph', 'text', 'br', 'tagref', 'image', 'link', 'emphasis', 'strong'] as const;
export type NodeType = typeof NodeType[number];

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
    type: 'text' | 'tagref' | 'br';
}
export interface TextLeafNode extends LeafNode {
    type: 'text' | 'tagref';
    text: string;
}
export interface TextNode extends TextLeafNode {
    type: 'text';
}
export interface TagRefNode extends TextLeafNode {
    type: 'tagref';
    tag?: string;
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
